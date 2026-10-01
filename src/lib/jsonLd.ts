import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';
import { toHref } from '@/lib/mediaUtils';
import { tmdbSocialImageUrl } from '@/lib/tmdbImage';
import { MediaType, NormalizedMedia } from '@/types';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBAPP_ID = `${SITE_URL}/#webapp`;
const ABOUT_PAGE_ID = `${SITE_URL}/about#webpage`;

const TMDB_PAGE_BASE = 'https://www.themoviedb.org';

type NodeReference = { '@id': string };

type Person = { '@type': 'Person'; name: string };

type Organization = {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: { '@type': 'ImageObject'; url: string };
};

type WebSite = {
  '@type': 'WebSite';
  '@id': string;
  name: string;
  url: string;
  description: string;
  publisher: NodeReference;
};

type AboutPage = {
  '@type': 'AboutPage';
  '@id': string;
  url: string;
  name: string;
  description: string;
  about: NodeReference;
};

type WebApplication = {
  '@type': 'WebApplication';
  '@id': string;
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  publisher: NodeReference;
  offers: { '@type': 'Offer'; price: string; priceCurrency: string };
};

export type SiteJsonLd = {
  '@context': 'https://schema.org';
  '@graph': [Organization, WebSite, WebApplication];
};

export type AboutPageJsonLd = {
  '@context': 'https://schema.org';
  '@graph': [AboutPage, Organization];
};

export type MediaJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Movie' | 'TVSeries';
  '@id': string;
  name: string;
  url: string;
  sameAs: string;
  description?: string;
  image?: string;
  genre?: string[];
  datePublished?: string;
  startDate?: string;
  duration?: string;
  director?: Person;
  creator?: Person;
};

export type BreadcrumbJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
};

export type JsonLd =
  | SiteJsonLd
  | AboutPageJsonLd
  | MediaJsonLd
  | BreadcrumbJsonLd;

// No sameAs: the product has no social profiles to point at.
function organizationNode(): Organization {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.webp') },
  };
}

// No SearchAction: /search?query= is noindex and disallowed in robots.txt.
export function siteJsonLd(): SiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'WebApplication',
        '@id': WEBAPP_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Web',
        publisher: { '@id': ORGANIZATION_ID },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  };
}

// The Organization node ships alongside the page node: a bare cross-page `@id`
// reference does not resolve for a validator that only reads /about.
export function aboutPageJsonLd(
  name: string,
  description: string,
): AboutPageJsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': ABOUT_PAGE_ID,
        url: absoluteUrl('/about'),
        name,
        description,
        about: { '@id': ORGANIZATION_ID },
      },
      organizationNode(),
    ],
  };
}

// `PT2H28M`, `PT45M`, `PT2H`. Undefined when there is no runtime to state.
function isoDuration(minutes: number | undefined): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `PT${hours ? `${hours}H` : ''}${rest ? `${rest}M` : ''}`;
}

export function mediaJsonLd(
  media: NormalizedMedia,
  mediaType: MediaType,
): MediaJsonLd {
  const {
    id,
    title,
    overview,
    poster_path,
    genres,
    release_date,
    runtime,
    director,
  } = media;
  const isSeries = mediaType === 'series';
  const genre = genres?.map((g) => g.name).filter(Boolean);
  const url = absoluteUrl(toHref(id, title, mediaType));
  // Movies only: for a series `runtime` is `episode_run_time[0]`, a per-episode
  // value, so publishing it as the series duration would state something false.
  const duration = isSeries ? undefined : isoDuration(runtime);

  return {
    '@context': 'https://schema.org',
    '@type': isSeries ? 'TVSeries' : 'Movie',
    '@id': `${url}#media`,
    name: title,
    url,
    sameAs: `${TMDB_PAGE_BASE}/${isSeries ? 'tv' : 'movie'}/${id}`,
    ...(overview ? { description: overview } : {}),
    ...(poster_path ? { image: tmdbSocialImageUrl(poster_path) } : {}),
    ...(genre?.length ? { genre } : {}),
    // `director` holds `created_by[0]` for a series, which is a creator credit.
    ...(director
      ? isSeries
        ? { creator: { '@type': 'Person' as const, name: director } }
        : { director: { '@type': 'Person' as const, name: director } }
      : {}),
    ...(!isSeries && release_date ? { datePublished: release_date } : {}),
    // `release_date` holds TMDB's `first_air_date` for a series.
    ...(isSeries && release_date ? { startDate: release_date } : {}),
    ...(duration ? { duration } : {}),
  };
}

// Two levels only: there is no listing page between home and a media page.
export function breadcrumbJsonLd(
  media: NormalizedMedia,
  mediaType: MediaType,
): BreadcrumbJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: media.title,
        item: absoluteUrl(toHref(media.id, media.title, mediaType)),
      },
    ],
  };
}

// TMDB copy is third-party text. Escaping `<` keeps a stray `</script>` in an
// overview from closing the tag early.
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
