import { NormalizedMedia } from '@/types';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';
import { tmdbSocialImageUrl } from '@/lib/tmdbImage';

export type JsonLdValue =
  | string
  | number
  | boolean
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLdGraph = {
  '@context': 'https://schema.org';
  '@type': string;
} & Record<string, JsonLdValue>;

const SCHEMA_CONTEXT = 'https://schema.org' as const;

// Search engines treat an empty string or a null as a broken value, so every
// optional field is spread in only when the source actually has one.
function optional(key: string, value?: string): Record<string, JsonLdValue> {
  return value ? { [key]: value } : {};
}

export function websiteJsonLd(): JsonLdGraph {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        // `query` is the param `(app)/search/page.tsx` reads.
        urlTemplate: `${SITE_URL}/search?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd(): JsonLdGraph {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo.webp'),
  };
}

function mediaGraph(
  media: NormalizedMedia,
  canonicalUrl: string,
  // `NormalizedMedia.director` holds the TMDB director for movies and
  // `created_by[0]` for series, so the two map to different schema.org props.
  personKey: 'director' | 'creator',
): Record<string, JsonLdValue> {
  const { title, poster_path, overview, genres, director } = media;
  const genreNames = genres?.map((genre) => genre.name).filter(Boolean) ?? [];

  return {
    name: title,
    url: canonicalUrl,
    ...optional('image', poster_path && tmdbSocialImageUrl(poster_path)),
    ...optional('description', overview),
    ...(genreNames.length > 0 ? { genre: genreNames } : {}),
    ...(director ? { [personKey]: { '@type': 'Person', name: director } } : {}),
  };
}

export function movieJsonLd(
  media: NormalizedMedia,
  canonicalUrl: string,
): JsonLdGraph {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Movie',
    ...mediaGraph(media, canonicalUrl, 'director'),
    ...optional('datePublished', media.release_date),
  };
}

export function tvSeriesJsonLd(
  media: NormalizedMedia,
  canonicalUrl: string,
): JsonLdGraph {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'TVSeries',
    ...mediaGraph(media, canonicalUrl, 'creator'),
    ...optional('startDate', media.release_date),
    ...optional('endDate', media.last_air_date),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLdGraph {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
