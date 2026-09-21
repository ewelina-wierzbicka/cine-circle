export const TMDB_HOST = 'https://image.tmdb.org';

// The size segment here is a fallback only. The custom image loader
// (`lib/imageLoader.ts`) rewrites it to the bucket matching the rendered
// width, so callers must not pick a width themselves.
export const TMDB_IMAGE_BASE = `${TMDB_HOST}/t/p/w342`;

export function tmdbImageUrl(path: string): string {
  return `${TMDB_IMAGE_BASE}${path}`;
}

// Social crawlers fetch the raw URL with no loader in front of it, so OG
// images need an explicitly large bucket rather than the w342 fallback.
export function tmdbSocialImageUrl(path: string): string {
  return `${TMDB_HOST}/t/p/w780${path}`;
}
