import type { Metadata } from 'next';
import { MediaType, NormalizedMedia } from '@/types';
import { toHref } from '@/lib/mediaUtils';
import { tmdbSocialImageUrl } from '@/lib/tmdbImage';

export const SITE_NAME = 'MidnightFrame';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export const SITE_TAGLINE = 'Track the movies and series you watch';

// Used for the OG/Twitter title and as the `title.default` fallback, where no
// template runs and the brand has to be spelled out.
export const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const SITE_DESCRIPTION =
  'MidnightFrame is a free movie and TV tracker. Log what you watch, rate it, write reviews, and build a collection you can share with friends.';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// Meta descriptions are truncated by Google around 160 characters.
export function truncateDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

// Shared by the /movie/[id] and /series/[id] generateMetadata functions.
export function mediaMetadata(
  media: NormalizedMedia,
  mediaType: MediaType,
): Metadata {
  const { id, title, release_date, last_air_date, poster_path, overview } =
    media;
  const year = (release_date ?? last_air_date)?.slice(0, 4);
  const heading = year ? `${title} (${year})` : title;
  const description = overview
    ? truncateDescription(overview)
    : `Track ${title} on ${SITE_NAME} — log it, rate it, and add it to your collection.`;
  const canonical = absoluteUrl(toHref(id, title, mediaType));
  const images = poster_path
    ? [
        {
          url: tmdbSocialImageUrl(poster_path),
          width: 780,
          height: 1170,
          alt: title,
        },
      ]
    : undefined;

  return {
    title: heading,
    description,
    alternates: { canonical },
    openGraph: {
      type: mediaType === 'series' ? 'video.tv_show' : 'video.movie',
      url: canonical,
      title: heading,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', images },
  };
}

export const NOT_FOUND_METADATA: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};
