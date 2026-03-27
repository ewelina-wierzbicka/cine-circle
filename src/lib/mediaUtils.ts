import { MediaType, NormalizedMedia, UserMedia } from '@/types';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function toHref(tmdbId: number, title: string, mediaType: MediaType): string {
  const base = mediaType === 'series' ? 'series' : 'movie';
  return `/${base}/${tmdbId}-${toSlug(title)}`;
}

export function toSearchMediaListProps(media: NormalizedMedia) {
  const { id, title, release_date, last_air_date, poster_path, media_type } =
    media;
  return {
    id,
    title,
    release_date,
    last_air_date,
    poster_path,
    media_type,
    href: toHref(id, title, media_type),
  };
}

export function toUserMediaListProps(userMedia: UserMedia) {
  const { media } = userMedia;
  const href = toHref(media.tmdb_id, media.title, media.media_type);
  return {
    id: userMedia.id,
    tmdb_id: media.tmdb_id,
    title: media.title,
    release_date: media.release_date,
    last_air_date: media.last_air_date,
    poster_path: media.poster_path,
    media_type: media.media_type,
    rating: userMedia.rating,
    watchStatus: userMedia.watchStatus,
    href,
  };
}
