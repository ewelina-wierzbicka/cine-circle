/**
 * The viewer's country from `x-vercel-ip-country`, or null when the request
 * carries no usable code.
 *
 * ponytail: geo header only, and no default country. `accept-language` was
 * tried and removed: it carries the browser's language, not the viewer's
 * location, so an English browser in Poland resolved to US. Defaulting to one
 * country is the same bug with a nicer name. Null means null, and the caller
 * says so rather than showing another country's providers.
 */
export function toWatchRegion(country: string | null): string | null {
  const code = country?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(code) ? code : null;
}
