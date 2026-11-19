import type { MediaType } from '@/types';

/**
 * Exact title URLs keyed by the brand keys in `providerWatchUrl.ts`.
 * A brand is absent whenever Wikidata holds no id for the title.
 */
export type ProviderDeepLinks = Record<string, string>;

export type WikidataClaims = Record<
  string,
  | {
      rank?: string;
      mainsnak?: { snaktype?: string; datavalue?: { value?: unknown } };
    }[]
  | undefined
>;

type DeepLinkRule = {
  brand: string;
  /** Wikidata property holding the provider's own id for the title. */
  property: string;
  url: (id: string) => string;
};

// Ordered within a brand: the first property present wins. Amazon therefore
// prefers the Prime Video id (P14440) and falls back to the ASIN (P8055).
const MOVIE_RULES: readonly DeepLinkRule[] = [
  {
    brand: 'netflix',
    property: 'P1874',
    url: (id) => `https://www.netflix.com/title/${id}`,
  },
  {
    brand: 'max',
    property: 'P8298',
    url: (id) => `https://www.hbomax.com/${id}`,
  },
  {
    brand: 'apple',
    property: 'P9586',
    url: (id) => `https://tv.apple.com/movie/${id}`,
  },
  {
    brand: 'amazon',
    property: 'P14440',
    url: (id) => `https://www.primevideo.com/detail/${id}`,
  },
  {
    brand: 'amazon',
    property: 'P8055',
    url: (id) => `https://www.amazon.com/gp/video/detail/${id}`,
  },
  {
    brand: 'disney',
    property: 'P7595',
    url: (id) => `https://www.disneyplus.com/movies/wd/${id}`,
  },
  {
    brand: 'hulu',
    property: 'P6466',
    url: (id) => `https://www.hulu.com/movie/${id}`,
  },
];

const SERIES_RULES: readonly DeepLinkRule[] = [
  {
    brand: 'netflix',
    property: 'P1874',
    url: (id) => `https://www.netflix.com/title/${id}`,
  },
  {
    brand: 'max',
    property: 'P8298',
    url: (id) => `https://www.hbomax.com/${id}`,
  },
  {
    brand: 'apple',
    property: 'P9751',
    url: (id) => `https://tv.apple.com/show/${id}`,
  },
  {
    brand: 'amazon',
    property: 'P14440',
    url: (id) => `https://www.primevideo.com/detail/${id}`,
  },
  {
    brand: 'amazon',
    property: 'P8055',
    url: (id) => `https://www.amazon.com/gp/video/detail/${id}`,
  },
  {
    brand: 'disney',
    property: 'P7596',
    url: (id) => `https://www.disneyplus.com/series/wp/${id}`,
  },
  {
    brand: 'hulu',
    property: 'P6467',
    url: (id) => `https://www.hulu.com/series/${id}`,
  },
];

// Wikidata ids are editable by anyone, so only path-safe values are used. No
// `?`, `#`, whitespace or leading slash can reach the formatter.
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;

function claimValue(
  claims: WikidataClaims,
  property: string,
): string | undefined {
  const usable = claims[property]?.filter(
    (statement) =>
      statement.rank !== 'deprecated' &&
      statement.mainsnak?.snaktype === 'value',
  );
  if (!usable?.length) return undefined;

  const best = usable.find((s) => s.rank === 'preferred') ?? usable[0];
  const value = best.mainsnak?.datavalue?.value;
  if (typeof value !== 'string') return undefined;

  return ID_PATTERN.test(value) && !value.includes('//') ? value : undefined;
}

export function buildProviderDeepLinks(
  claims: WikidataClaims,
  mediaType: MediaType,
): ProviderDeepLinks {
  const rules = mediaType === 'series' ? SERIES_RULES : MOVIE_RULES;
  const links: ProviderDeepLinks = {};

  for (const { brand, property, url } of rules) {
    if (links[brand]) continue;
    const id = claimValue(claims, property);
    if (id) links[brand] = url(id);
  }

  return links;
}
