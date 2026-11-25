const AUTH_TOKEN_COOKIE = /^sb-.+-auth-token(\.(0|[1-9][0-9]*))?$/;

export function hasAuthCookie(cookies: { name: string }[]): boolean {
  return cookies.some(({ name }) => AUTH_TOKEN_COOKIE.test(name));
}
