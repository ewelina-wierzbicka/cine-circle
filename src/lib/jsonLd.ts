import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';
import { HOME_FAQ } from '@/lib/homeFaq';
import { toHref } from '@/lib/mediaUtils';
import { tmdbSocialImageUrl } from '@/lib/tmdbImage';
import { MediaType, NormalizedMedia } from '@/types';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBAPP_ID = `${SITE_URL}/#webapp`;
const FAQ_ID = `${SITE_URL}/#faq`;

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

export type MediaJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Movie' | 'TVSeries';
  name: string;
  url: string;
  sameAs: string;
  description?: string;
  image?: string;
  genre?: string[];
  datePublished?: string;
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

export type FaqJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  '@id': string;
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }[];
};

export type JsonLd = SiteJsonLd | MediaJsonLd | BreadcrumbJsonLd | FaqJsonLd;

// No SearchAction: /search?query= is noindex and disallowed in robots.txt.
// No sameAs: the product has no social profiles to point at.
export function siteJsonLd(): SiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.webp') },
      },
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

// Built from HOME_FAQ, the same array `HomeAbout` renders on `/`, so the
// answers in the markup and the answers here are one source.
export function faqJsonLd(): FaqJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': FAQ_ID,
    mainEntity: HOME_FAQ.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function mediaJsonLd(
  media: NormalizedMedia,
  mediaType: MediaType,
): MediaJsonLd {
  const { id, title, overview, poster_path, genres, release_date, director } =
    media;
  const isSeries = mediaType === 'series';
  const genre = genres?.map((g) => g.name).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': isSeries ? 'TVSeries' : 'Movie',
    name: title,
    url: absoluteUrl(toHref(id, title, mediaType)),
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
