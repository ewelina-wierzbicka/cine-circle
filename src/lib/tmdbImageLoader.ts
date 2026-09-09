import type { ImageLoaderProps } from 'next/image';

const TMDB_POSTER_WIDTHS = [92, 154, 185, 342, 500, 780] as const;

// Serves TMDB images directly from TMDB's CDN, bypassing Next.js image
// optimization. This avoids Vercel's image optimization quota and network
// restrictions in production.
export function tmdbImageLoader({ src, width }: ImageLoaderProps): string {
  const path = src.startsWith('https://image.tmdb.org')
    ? src.replace(/^https:\/\/image\.tmdb\.org\/t\/p\/\w+/, '')
    : src;
  const tmdbWidth = TMDB_POSTER_WIDTHS.find((w) => w >= width) ?? 'original';
  return `https://image.tmdb.org/t/p/w${tmdbWidth}${path}`;
}
