// @vitest-environment node
// Pure route logic plus a filesystem walk: no DOM, and jsdom rewrites
// import.meta.url to an http URL that fileURLToPath rejects.
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import proxy, { config, isKnownRoute, parseMediaRoute } from '@/proxy';
import type { ResolvedMedia } from '@/services/resolveMedia';

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const resolveMedia = vi.fn<(mediaType: string, id: string) => ResolvedMedia>();
// Records that the Supabase client was constructed at all, which is the whole
// cost the cookie-less branch skips.
const createServerClient = vi.fn<(url: string, anonKey: string) => void>();
// Cookies Supabase refreshes mid-request; every exit path must carry them.
let refreshedCookies: CookieToSet[] = [];
let sessionUser: { id: string } | null = null;

vi.mock('@/services/resolveMedia', () => ({
  resolveMedia: (mediaType: string, id: string) => resolveMedia(mediaType, id),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    url: string,
    anonKey: string,
    options: { cookies: { setAll: (cookies: CookieToSet[]) => void } },
  ) => {
    createServerClient(url, anonKey);
    return {
      auth: {
        getUser: async () => {
          if (refreshedCookies.length) options.cookies.setAll(refreshedCookies);
          return { data: { user: sessionUser } };
        },
      },
    };
  },
}));

// A session cookie Supabase would have written. Its presence is what decides
// whether the proxy pays for a `getUser()` round trip.
const SESSION_COOKIE = { cookie: 'sb-localhost-auth-token=session-value' };

function mediaRequest(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers });
}

function locationOf(response: Response) {
  return new URL(response.headers.get('location') ?? '');
}

beforeEach(() => {
  resolveMedia.mockReset();
  createServerClient.mockReset();
  refreshedCookies = [];
  sessionUser = null;
});

describe('isKnownRoute', () => {
  it.each([
    // AUTH_ROUTES
    '/login',
    '/register',
    '/confirm-email',
    '/forgot-password',
    '/registration-confirmed',
    // OPEN_ROUTES_EXACT
    '/',
    '/about',
    '/terms',
    '/privacy',
    // private and session-gated
    '/collection',
    '/profile',
    '/reset-password',
    '/search',
  ])('knows %s', (path) => {
    expect(isKnownRoute(path)).toBe(true);
  });

  it.each(['/movie/550', '/series/1399'])(
    'knows the media route %s',
    (path) => {
      expect(isKnownRoute(path)).toBe(true);
    },
  );

  it('normalises a trailing slash', () => {
    expect(isKnownRoute('/profile/')).toBe(true);
  });

  it.each(['/nonexistent-xyz', '/llms.txt', '/manifest.webmanifest'])(
    'does not know %s',
    (path) => {
      expect(isKnownRoute(path)).toBe(false);
    },
  );
});

describe('parseMediaRoute', () => {
  it('parses a movie slug', () => {
    expect(parseMediaRoute('/movie/550-fight-club')).toEqual({
      mediaType: 'movie',
      id: '550',
    });
  });

  it('parses a bare series id', () => {
    expect(parseMediaRoute('/series/1399')).toEqual({
      mediaType: 'series',
      id: '1399',
    });
  });

  it('returns a null id for a non-numeric slug', () => {
    expect(parseMediaRoute('/movie/fight-club')).toEqual({
      mediaType: 'movie',
      id: null,
    });
  });

  it.each(['/movie/550/cast', '/movie/'])('returns null for %s', (path) => {
    expect(parseMediaRoute(path)).toBeNull();
  });

  it('tolerates a trailing slash', () => {
    expect(parseMediaRoute('/movie/550/')).toEqual({
      mediaType: 'movie',
      id: '550',
    });
  });

  it('returns null for a non-media path', () => {
    expect(parseMediaRoute('/profile')).toBeNull();
  });
});

const APP_DIR = fileURLToPath(new URL('./app', import.meta.url));

// Maps `(app)/movie/[id]/page.tsx` to `/movie/123`: route groups vanish from
// the URL, and a dynamic segment is filled with a sample numeric id.
function toRoutePath(pageFile: string): string {
  const segments = pageFile
    .split('/')
    .slice(0, -1)
    .filter((segment) => !/^\(.+\)$/.test(segment))
    .map((segment) => (/^\[.+\]$/.test(segment) ? '123' : segment));
  return `/${segments.join('/')}`;
}

function pageRoutes(): string[] {
  return readdirSync(APP_DIR, { recursive: true, encoding: 'utf8' })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => /^\((app|auth)\)\/(.+\/)?page\.tsx$/.test(file))
    .map(toRoutePath)
    .sort();
}

// An unlisted page is passed through by the proxy, so it renders for everyone
// with no auth gate. Every page under (app) and (auth) must be known.
describe('route registration', () => {
  it('maps route groups and dynamic segments to URL paths', () => {
    expect(toRoutePath('(app)/page.tsx')).toBe('/');
    expect(toRoutePath('(app)/movie/[id]/page.tsx')).toBe('/movie/123');
    expect(toRoutePath('(auth)/login/page.tsx')).toBe('/login');
  });

  it('finds the page routes', () => {
    const routes = pageRoutes();
    expect(routes).toContain('/');
    expect(routes).toContain('/movie/123');
    expect(routes).toContain('/login');
    expect(routes.length).toBeGreaterThanOrEqual(15);
  });

  it.each(pageRoutes())('registers %s as a known route', (route) => {
    expect(isKnownRoute(route)).toBe(true);
  });
});

describe('media route responses', () => {
  it('rewrites an unknown id to the not-found route, marked noindex', async () => {
    resolveMedia.mockReturnValue({ exists: false, id: null, title: null });

    const response = await proxy(mediaRequest('/movie/999999999'));

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost:3000/_not-found',
    );
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('marks a non-numeric slug noindex without asking TMDB', async () => {
    const response = await proxy(mediaRequest('/movie/abc'));

    expect(resolveMedia).not.toHaveBeenCalled();
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost:3000/_not-found',
    );
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('carries a refreshed session cookie on the not-found response', async () => {
    resolveMedia.mockReturnValue({ exists: false, id: null, title: null });
    refreshedCookies = [{ name: 'sb-access-token', value: 'refreshed' }];

    const response = await proxy(
      mediaRequest('/series/999999999', SESSION_COOKIE),
    );

    expect(response.cookies.get('sb-access-token')?.value).toBe('refreshed');
  });

  it('carries a refreshed session cookie on the canonical redirect', async () => {
    resolveMedia.mockReturnValue({
      exists: true,
      id: 550,
      title: 'Fight Club',
    });
    refreshedCookies = [{ name: 'sb-access-token', value: 'refreshed' }];

    const response = await proxy(
      mediaRequest('/movie/550-wrong', SESSION_COOKIE),
    );

    expect(response.status).toBe(308);
    expect(response.cookies.get('sb-access-token')?.value).toBe('refreshed');
  });

  it('redirects a mis-slugged URL to the canonical path, query intact', async () => {
    resolveMedia.mockReturnValue({
      exists: true,
      id: 550,
      title: 'Fight Club',
    });

    const response = await proxy(mediaRequest('/movie/550-wrong?tab=watched'));

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/movie/550-fight-club?tab=watched',
    );
    expect(response.headers.get('x-robots-tag')).toBeNull();
  });

  it('leaves the canonical slug alone', async () => {
    resolveMedia.mockReturnValue({
      exists: true,
      id: 550,
      title: 'Fight Club',
    });

    const response = await proxy(mediaRequest('/movie/550-fight-club'));

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('x-robots-tag')).toBeNull();
  });

  it('passes the request through when TMDB cannot resolve the id', async () => {
    resolveMedia.mockReturnValue({ exists: true, id: null, title: null });

    const response = await proxy(mediaRequest('/movie/550'));

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    expect(response.headers.get('x-robots-tag')).toBeNull();
  });

  it('skips the lookup for an RSC navigation', async () => {
    const response = await proxy(
      mediaRequest('/movie/999999999', { rsc: '1' }),
    );

    expect(resolveMedia).not.toHaveBeenCalled();
    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });
});

// No session cookie means no session to read and none to refresh, so the
// Supabase round trip is skipped. Every routing decision must be unchanged.
describe('the cookie-less branch', () => {
  it.each(['/collection', '/profile', '/reset-password'])(
    'redirects %s to login without constructing a Supabase client',
    async (path) => {
      const response = await proxy(mediaRequest(path));

      expect(createServerClient).not.toHaveBeenCalled();
      expect(response.status).toBe(307);
      expect(locationOf(response).pathname).toBe('/login');
      expect(locationOf(response).searchParams.get('rurl')).toBe(path);
    },
  );

  it.each(['/', '/about', '/login', '/search'])(
    'serves %s without constructing a Supabase client',
    async (path) => {
      const response = await proxy(mediaRequest(path));

      expect(createServerClient).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    },
  );

  it('still rewrites an unknown media id to the noindex 404', async () => {
    resolveMedia.mockReturnValue({ exists: false, id: null, title: null });

    const response = await proxy(mediaRequest('/movie/999999999'));

    expect(createServerClient).not.toHaveBeenCalled();
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost:3000/_not-found',
    );
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('still redirects a mis-slugged media URL to the canonical path', async () => {
    resolveMedia.mockReturnValue({
      exists: true,
      id: 550,
      title: 'Fight Club',
    });

    const response = await proxy(mediaRequest('/movie/550'));

    expect(createServerClient).not.toHaveBeenCalled();
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/movie/550-fight-club',
    );
  });
});

describe('the cookie-bearing branch', () => {
  it('asks Supabase for the session', async () => {
    const response = await proxy(mediaRequest('/collection', SESSION_COOKIE));

    expect(createServerClient).toHaveBeenCalledTimes(1);
    // A cookie is not a session: an expired one still redirects to login.
    expect(locationOf(response).pathname).toBe('/login');
  });

  it('serves a private route to a signed-in user', async () => {
    sessionUser = { id: 'user-1' };

    const response = await proxy(mediaRequest('/collection', SESSION_COOKIE));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it.each(['/login', '/register', '/registration-confirmed'])(
    'redirects a signed-in user off %s',
    async (path) => {
      sessionUser = { id: 'user-1' };

      const response = await proxy(mediaRequest(path, SESSION_COOKIE));

      expect(response.status).toBe(307);
      expect(locationOf(response).pathname).toBe('/');
    },
  );

  it('carries a refreshed session cookie on the login redirect', async () => {
    refreshedCookies = [{ name: 'sb-access-token', value: 'refreshed' }];

    const response = await proxy(mediaRequest('/profile', SESSION_COOKIE));

    expect(locationOf(response).pathname).toBe('/login');
    expect(response.cookies.get('sb-access-token')?.value).toBe('refreshed');
  });

  it('carries a refreshed session cookie off an auth route', async () => {
    sessionUser = { id: 'user-1' };
    refreshedCookies = [{ name: 'sb-access-token', value: 'refreshed' }];

    const response = await proxy(mediaRequest('/login', SESSION_COOKIE));

    expect(locationOf(response).pathname).toBe('/');
    expect(response.cookies.get('sb-access-token')?.value).toBe('refreshed');
  });

  it('resolves the media id alongside the session check', async () => {
    resolveMedia.mockReturnValue({ exists: false, id: null, title: null });

    const response = await proxy(
      mediaRequest('/movie/999999999', SESSION_COOKIE),
    );

    expect(createServerClient).toHaveBeenCalledTimes(1);
    expect(resolveMedia).toHaveBeenCalledWith('movie', '999999999');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});

// Each excluded path is one middleware invocation we do not pay for.
describe('config.matcher', () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);

  it.each([
    '/',
    '/collection',
    '/profile',
    '/login',
    '/search',
    '/movie/550',
    '/movie/550-fight-club',
    '/series/1399',
    '/nonexistent-xyz',
  ])('invokes the proxy for %s', (path) => {
    expect(matcher.test(path)).toBe(true);
  });

  it.each([
    '/icons/icon-512.png',
    '/icons/icon-maskable-512.png',
    '/.well-known/anything',
    '/.well-known/appspecific/com.chrome.devtools.json',
    '/_vercel/insights/script.js',
    '/_next/static/chunks/main.js',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
    '/manifest.webmanifest',
    '/opengraph-image.png',
    '/logo.webp',
    '/api/cron/keep-alive',
  ])('skips the proxy for %s', (path) => {
    expect(matcher.test(path)).toBe(false);
  });
});
