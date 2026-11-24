export function hasAuthCookie(cookies: { name: string }[]): boolean {
  return cookies.some(
    ({ name }) => name.startsWith('sb-') && name.includes('-auth-token'),
  );
}
