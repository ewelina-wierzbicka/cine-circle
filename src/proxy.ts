import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
