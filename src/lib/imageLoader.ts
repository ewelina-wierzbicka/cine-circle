import type { ImageLoaderProps } from 'next/image';

const TMDB_HOST = 'https://image.tmdb.org';

// TMDB serves fixed width buckets. Anything wider falls back to `original`.
const TMDB_WIDTHS = [92, 154, 185, 342, 500, 780] as const;

const TMDB_SIZE_SEGMENT = /^\/t\/p\/[^/]+/;

function tmdbSize(width: number): string {
  const bucket = TMDB_WIDTHS.find((w) => w >= width);
  return bucket ? `w${bucket}` : 'original';
}

// Global loader — `images.loaderFile` applies to every next/image usage, so
// non-TMDB sources (Supabase avatars, local /logo.png) pass straight through.
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (!src.startsWith(`${TMDB_HOST}/`)) return src;

  const path = src.slice(TMDB_HOST.length).replace(TMDB_SIZE_SEGMENT, '');
  return `${TMDB_HOST}/t/p/${tmdbSize(width)}${path}`;
}
