/**
 * The viewer's country from `x-vercel-ip-country`, or null when the request
 * carries no usable code.
 */
export function toWatchRegion(country: string | null): string | null {
  const code = country?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(code) ? code : null;
}
