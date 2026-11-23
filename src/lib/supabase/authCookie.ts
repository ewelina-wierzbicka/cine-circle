/** True when the cookie list carries a `sb-<project-ref>-auth-token`, chunked or not. */
export function hasAuthCookie(cookies: { name: string }[]): boolean {
  return cookies.some(
    ({ name }) => name.startsWith('sb-') && name.includes('-auth-token'),
  );
}
