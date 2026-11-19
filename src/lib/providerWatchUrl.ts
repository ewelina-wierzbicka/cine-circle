// these are provider search URLs, not exact-title deep links. TMDB
// ships one aggregate `link` per title and no per-provider offer URLs.
// Exact URLs come from Wikidata when it has an id, see `providerDeepLinks.ts`.
import type { ProviderDeepLinks } from './providerDeepLinks';

type Brand = { ids: number[]; url: (q: string) => string };

// One entry per streaming brand. TMDB lists a brand's tiers (ads, standard,
// channel add-ons) as separate provider ids with separate logos.
const BRANDS: Record<string, Brand> = {
  netflix: {
    ids: [8, 175, 1796],
    url: (q) => `https://www.netflix.com/search?q=${q}`,
  },
  amazon: {
    ids: [9, 10, 613, 2100],
    url: (q) => `https://www.primevideo.com/search?phrase=${q}`,
  },
  apple: {
    ids: [350, 2, 2243],
    url: (q) => `https://tv.apple.com/search?term=${q}`,
  },
  disney: {
    ids: [337],
    url: (q) => `https://www.disneyplus.com/search?q=${q}`,
  },
  hulu: { ids: [15], url: (q) => `https://www.hulu.com/search?q=${q}` },
  max: { ids: [1899], url: (q) => `https://play.max.com/search?q=${q}` },
  crunchyroll: {
    ids: [283],
    url: (q) => `https://www.crunchyroll.com/search?q=${q}`,
  },
  youtube: {
    ids: [192, 188, 235],
    url: (q) => `https://www.youtube.com/results?search_query=${q}`,
  },
  googlePlay: {
    ids: [3],
    url: (q) => `https://play.google.com/store/search?c=movies&q=${q}`,
  },
  paramount: {
    ids: [2303, 2616],
    url: (q) => `https://www.paramountplus.com/search/?q=${q}`,
  },
};

const BRAND_BY_ID = new Map<number, string>(
  Object.entries(BRANDS).flatMap(([brand, { ids }]) =>
    ids.map((id): [number, string] => [id, brand]),
  ),
);

export const MAPPED_PROVIDER_IDS: number[] = [...BRAND_BY_ID.keys()];

export function providerBrandKey(providerId: number): string {
  return BRAND_BY_ID.get(providerId) ?? `id:${providerId}`;
}

/** Exact deep link first, then the brand search URL, then TMDB's aggregate. */
export function providerWatchUrl(
  providerId: number,
  title: string,
  fallback?: string,
  deepLinks?: ProviderDeepLinks,
): string | undefined {
  const brand = BRAND_BY_ID.get(providerId);
  if (!brand) return fallback;
  return deepLinks?.[brand] ?? BRANDS[brand].url(encodeURIComponent(title));
}
