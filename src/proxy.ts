import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';
import { toHref } from './lib/mediaUtils';
import { resolveMedia } from './services/resolveMedia';

// Auth-only routes: redirect authenticated users away
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/confirm-email',
  '/forgot-password',
  '/registration-confirmed',
];
// Open routes: accessible to everyone (no redirect for unauthenticated users)
const OPEN_ROUTES_EXACT = ['/', '/about', '/terms', '/privacy'];
const OPEN_ROUTE_PREFIXES = ['/search', '/movie/', '/series/'];

// Unlisted paths pass through, so Next.js 404s a URL that matches no route.
// A real page left off this list does not 404: it renders with no auth gate.
const KNOWN_ROUTES_EXACT = [
  ...AUTH_ROUTES,
  ...OPEN_ROUTES_EXACT,
  '/search',
  '/collection',
  '/profile',
  '/reset-password',
];
const KNOWN_ROUTE_PREFIXES = ['/movie/', '/series/'];

export function isKnownRoute(pathname: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  return (
    KNOWN_ROUTES_EXACT.includes(normalized) ||
    KNOWN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

const MEDIA_ROUTES = [
  ['/movie/', 'movie'],
  ['/series/', 'series'],
] as const;

type MediaRoute = {
  mediaType: 'movie' | 'series';
  // null when the slug does not start with a numeric TMDB id.
  id: string | null;
};

export function parseMediaRoute(pathname: string): MediaRoute | null {
  for (const [prefix, mediaType] of MEDIA_ROUTES) {
    if (!pathname.startsWith(prefix)) continue;

    const slug = pathname.slice(prefix.length).replace(/\/$/, '');
    if (!slug || slug.includes('/')) return null;

    const id = slug.split('-')[0];
    return { mediaType, id: /^\d+$/.test(id) ? id : null };
  }
  return null;
}

type MediaRouteOutcome =
  // Not a media route, or TMDB could not be resolved: let the request through.
  | { kind: 'ignore' }
  | { kind: 'missing' }
  | { kind: 'canonical'; path: string };

// `/movie/[id]` is a PPR route: the prerendered shell flushes a 200 before the
// page body runs, so `notFound()` and `permanentRedirect()` in `MediaPage` can
// only swap the body and the status stays 200. Crawlers read that as a soft 404
// and Next downgrades the redirect to a `<meta http-equiv="refresh">`. Resolve
// the id here, before the response starts, so an unknown id gets a real 404 and
// a mis-slugged URL a real 308.
async function resolveMediaRoute(
  request: NextRequest,
): Promise<MediaRouteOutcome> {
  if (request.headers.get('rsc')) return { kind: 'ignore' };

  const route = parseMediaRoute(request.nextUrl.pathname);
  if (!route) return { kind: 'ignore' };
  if (!route.id) return { kind: 'missing' };

  const resolved = await resolveMedia(route.mediaType, route.id);
  if (!resolved.exists) return { kind: 'missing' };
  if (resolved.id === null || resolved.title === null)
    return { kind: 'ignore' };

  return {
    kind: 'canonical',
    path: toHref(resolved.id, resolved.title, route.mediaType),
  };
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isKnownRoute(pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const [
    {
      data: { user },
    },
    mediaRoute,
  ] = await Promise.all([supabase.auth.getUser(), resolveMediaRoute(request)]);

  const withSessionCookies = (response: NextResponse) => {
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (mediaRoute.kind === 'missing') {
    return withSessionCookies(
      NextResponse.rewrite(new URL('/_not-found', request.url)),
    );
  }

  // A mis-slugged URL answers a real 308 to the canonical slug, query intact.
  if (mediaRoute.kind === 'canonical' && mediaRoute.path !== pathname) {
    const canonicalUrl = new URL(mediaRoute.path, request.url);
    canonicalUrl.search = request.nextUrl.search;
    return withSessionCookies(NextResponse.redirect(canonicalUrl, 308));
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isOpenRoute =
    OPEN_ROUTES_EXACT.includes(pathname) ||
    OPEN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!user && !isAuthRoute && !isOpenRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('rurl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Run only on page routes. Excluded:
  // - _next/* static assets and image optimisation
  // - favicon and common image extensions
  // - sitemap.xml, robots.txt, llms.txt, llms-full.txt, manifest.webmanifest,
  //   opengraph-image —
  //   metadata routes. They carry no session and must never redirect, or
  //   crawlers cannot fetch them and the install prompt never appears
  // - /api/* — TMDB proxy routes don't use Supabase auth;
  //   add individual API paths back here once they require session data
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|llms-full.txt|manifest.webmanifest|opengraph-image|api/|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
