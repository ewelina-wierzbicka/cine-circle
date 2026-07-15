import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';

// Auth-only routes: redirect authenticated users away
const AUTH_ROUTES = ['/login', '/register', '/confirm-email'];
// Open routes: accessible to everyone (no redirect for unauthenticated users)
const OPEN_ROUTES_EXACT = ['/'];
const OPEN_ROUTE_PREFIXES = ['/search', '/movie/', '/series/'];

export default async function proxy(request: NextRequest) {
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

  const { pathname } = request.nextUrl;
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
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
