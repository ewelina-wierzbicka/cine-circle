// @vitest-environment node
// Pure route logic plus a filesystem walk: no DOM, and jsdom rewrites
// import.meta.url to an http URL that fileURLToPath rejects.
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import proxy, { isKnownRoute, parseMediaRoute } from '@/proxy';
import type { ResolvedMedia } from '@/services/resolveMedia';

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const resolveMedia = vi.fn<(mediaType: string, id: string) => ResolvedMedia>();
// Cookies Supabase refreshes mid-request; the 404 and 308 paths must carry them.
let refreshedCookies: CookieToSet[] = [];

vi.mock('@/services/resolveMedia', () => ({
  resolveMedia: (mediaType: string, id: string) => resolveMedia(mediaType, id),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _anonKey: string,
    options: { cookies: { setAll: (cookies: CookieToSet[]) => void } },
  ) => ({
    auth: {
      getUser: async () => {
        if (refreshedCookies.length) options.cookies.setAll(refreshedCookies);
        return { data: { user: null } };
      },
    },
  }),
}));

function mediaRequest(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers });
}

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
  beforeEach(() => {
    resolveMedia.mockReset();
    refreshedCookies = [];
  });

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

    const response = await proxy(mediaRequest('/series/999999999'));

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
