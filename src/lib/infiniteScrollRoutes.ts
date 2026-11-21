export const INFINITE_SCROLL_ROUTES = ['/search', '/collection'] as const;

export function isInfiniteScrollRoute(pathname: string): boolean {
  return INFINITE_SCROLL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
