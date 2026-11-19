export const DEFAULT_WATCH_REGION = 'US';

// the country comes from `x-vercel-ip-country`, then the region
// subtag of the highest-weighted `accept-language` entry, then US.
export function toWatchRegion(
  country: string | null,
  acceptLanguage: string | null = null,
): string {
  return (
    toCountryCode(country) ??
    regionFromAcceptLanguage(acceptLanguage) ??
    DEFAULT_WATCH_REGION
  );
}

function toCountryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function regionFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null;

  const ranked = header
    .split(',')
    .map((entry, index) => ({ ...parseLanguageRange(entry), index }))
    .filter((entry) => entry.tag !== '' && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);

  for (const { tag } of ranked) {
    const region = regionSubtag(tag);
    if (region) return region;
  }
  return null;
}

function parseLanguageRange(entry: string): { tag: string; weight: number } {
  const [tag, ...params] = entry.split(';');
  const q = params
    .map((param) => param.trim().match(/^q=(.*)$/i)?.[1])
    .find((value) => value !== undefined);
  const parsed = q === undefined ? 1 : Number(q);
  return {
    tag: tag.trim(),
    weight: Number.isFinite(parsed) ? parsed : 1,
  };
}

function regionSubtag(tag: string): string | null {
  const subtags = tag.split('-').slice(1);
  for (const subtag of subtags) {
    const code = toCountryCode(subtag);
    if (code) return code;
  }
  return null;
}
