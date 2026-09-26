import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';
import { mediaExists } from './services/mediaExists';

// Auth-only routes: redirect authenticated users away
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/confirm-email',
  '/forgot-password',
  '/registration-confirmed',
];
// Open routes: accessible to everyone (no redirect for unauthenticated users)
const OPEN_ROUTES_EXACT = ['/', '/terms', '/privacy'];
const OPEN_ROUTE_PREFIXES = ['/search', '/movie/', '/series/'];

// IMPORTANT: a new page route MUST end up in KNOWN_ROUTES_EXACT or KNOWN_ROUTE_PREFIXES list, or it will 404.
const KNOWN_ROUTES_EXACT = [
  ...AUTH_ROUTES,
  ...OPEN_ROUTES_EXACT,
  '/search',
  '/collection',
  '/profile',
  '/reset-password',
];
const KNOWN_ROUTE_PREFIXES = ['/movie/', '/series/'];

function isKnownRoute(pathname: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  return (
    KNOWN_ROUTES_EXACT.includes(normalized) ||
    KNOWN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

// The `/movie/[id]` and `/series/[id]` route prefixes, with the media type
// `mediaExists` expects.
const MEDIA_ROUTES = [
  ['/movie/', 'movie'],
  ['/series/', 'series'],
] as const;

type MediaRoute = {
  mediaType: 'movie' | 'series';
  // null when the slug does not start with a numeric TMDB id.
  id: string | null;
};

function parseMediaRoute(pathname: string): MediaRoute | null {
  for (const [prefix, mediaType] of MEDIA_ROUTES) {
    if (!pathname.startsWith(prefix)) continue;

    const slug = pathname.slice(prefix.length).replace(/\/$/, '');
    // Anything deeper than one segment matches no route; Next.js 404s it.
    if (!slug || slug.includes('/')) return null;

    const id = slug.split('-')[0];
    return { mediaType, id: /^\d+$/.test(id) ? id : null };
  }
  return null;
}

// `/movie/[id]` is a PPR route: the prerendered shell flushes a 200 before the
// page body runs, so `notFound()` in `MediaPage` can only swap the body and the
// status stays 200. Crawlers read that as a soft 404. Resolve the id here,
// before the response starts, so an unknown id gets a real 404.
async function isMissingMediaRoute(request: NextRequest): Promise<boolean> {
  // RSC navigations never reach a crawler and still render the not-found UI
  // via `notFound()`. Skip the lookup so in-app navigation stays cheap.
  if (request.headers.get('rsc')) return false;

  const route = parseMediaRoute(request.nextUrl.pathname);
  if (!route) return false;
  if (!route.id) return true;

  return !(await mediaExists(route.mediaType, route.id));
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

  // Run both round trips at once; the media lookup must not add latency on top
  // of the session check.
  const [
    {
      data: { user },
    },
    isMissingMedia,
  ] = await Promise.all([
    supabase.auth.getUser(),
    isMissingMediaRoute(request),
  ]);

  if (isMissingMedia) {
    const notFoundResponse = NextResponse.rewrite(
      new URL('/_not-found', request.url),
    );
    // Carry over any session cookie Supabase refreshed above.
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => notFoundResponse.cookies.set(cookie));
    return notFoundResponse;
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
  // - /api/* — TMDB proxy routes don't use Supabase auth;
  //   add individual API paths back here once they require session data
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|api/|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
