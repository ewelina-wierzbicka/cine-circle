/**
 * Open-redirect guard for a `rurl` arriving from a query string.
 * Only a same-site path is accepted: it must start with a single `/`,
 * so `https://evil.com` is rejected, and so is `//evil.com` or `/\evil.com`,
 * which browsers resolve as a protocol-relative host.
 */
export function safeRedirectPath(
  rurl: string | null | undefined,
): string | undefined {
  if (!rurl) return undefined;
  if (!rurl.startsWith('/')) return undefined;
  if (rurl.startsWith('//') || rurl.startsWith('/\\')) return undefined;
  return rurl;
}
