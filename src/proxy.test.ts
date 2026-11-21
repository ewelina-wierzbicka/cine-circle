// @vitest-environment node
// Pure route logic plus a filesystem walk: no DOM, and jsdom rewrites
// import.meta.url to an http URL that fileURLToPath rejects.
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isKnownRoute, parseMediaRoute } from '@/proxy';

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
