/** Region used when the request carries no usable country code. */
export const DEFAULT_WATCH_REGION = 'US';

// ponytail: the country comes from the Vercel geo header `x-vercel-ip-country`,
// read with headers() at the call site so the dynamic access stays inside the
// Suspense subtree. A region saved on the user profile is out of scope here.
export function toWatchRegion(country: string | null): string {
  const code = country?.toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(code) ? code : DEFAULT_WATCH_REGION;
}
