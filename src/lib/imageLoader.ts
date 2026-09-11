import type { ImageLoaderProps } from 'next/image';

const TMDB_HOST = 'https://image.tmdb.org';

// TMDB serves fixed width buckets. Anything wider falls back to `original`.
const TMDB_WIDTHS = [92, 154, 185, 342, 500, 780] as const;

// Matches `/t/p/<size>/<file>`. Capture group 1 is the file part we keep.
const TMDB_PATH = /^\/t\/p\/[^/]+(\/.+)$/;

function tmdbSize(width: number): string {
  const bucket = TMDB_WIDTHS.find((w) => w >= width);
  return bucket ? `w${bucket}` : 'original';
}

// `images.loaderFile` is global, so this runs for every next/image usage.
//
// Non-TMDB sources (Supabase avatars, local /logo.png) are returned as-is.
// They cannot be forwarded to `/_next/image`: Next.js 404s that route whenever
// `images.loader` is `custom` (see next-server.js, `imagesConfig.loader !==
// 'default'` -> render404), so any optimizer URL we built would be a dead link.
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (!src.startsWith(`${TMDB_HOST}/`)) return src;

  const file = TMDB_PATH.exec(src.slice(TMDB_HOST.length))?.[1];
  if (!file) return src;

  return `${TMDB_HOST}/t/p/${tmdbSize(width)}${file}`;
}
