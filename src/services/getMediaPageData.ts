import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getUserMedia } from '@/services/getUserMedia';
import { NormalizedMedia, SavedMedia, UserMedia } from '@/types';

type MediaPageData = {
  data: SavedMedia | NormalizedMedia | null;
  error: string | null;
  initialStep: number;
};

type TmdbExtra = Pick<
  NormalizedMedia,
  'genres' | 'overview' | 'recommendations' | 'director'
>;

export async function getMediaPageData(
  slug: string,
  mediaType: 'movie' | 'series',
  stepParam?: string,
  userId?: string | null,
): Promise<MediaPageData> {
  const id = slug.split('-')[0];
  const tmdbId = Number(id);
  const initialStep = stepParam === '2' ? 2 : 1;

  const tmdbPromise: Promise<NormalizedMedia> =
    mediaType === 'series' ? getSeriesDetails(id) : getMovieDetails(id);

  const userMediaPromise: Promise<UserMedia | null> = userId
    ? getUserMedia(tmdbId, mediaType, userId).catch((err) => {
        const isNotFound = (err as { code?: string }).code === 'PGRST116';
        if (isNotFound) return null;
        throw err;
      })
    : Promise.resolve(null);

  const [tmdbSettled, userMediaSettled] = await Promise.allSettled([
    tmdbPromise,
    userMediaPromise,
  ]);

  if (userMediaSettled.status === 'rejected') {
    return {
      data: null,
      error:
        (userMediaSettled.reason as Error).message ||
        'Failed to load saved data.',
      initialStep,
    };
  }

  const userMedia =
    userMediaSettled.status === 'fulfilled' ? userMediaSettled.value : null;
  const tmdb = tmdbSettled.status === 'fulfilled' ? tmdbSettled.value : null;
  const tmdbError =
    tmdbSettled.status === 'rejected'
      ? (tmdbSettled.reason as Error).message || 'Failed to load data.'
      : null;

  if (userMedia) {
    const {
      id: savedId,
      watchStatus,
      watched_date,
      rating,
      review,
      media,
    } = userMedia;
    const {
      tmdb_id,
      title,
      release_date,
      last_air_date,
      poster_path,
      media_type,
    } = media;

    const tmdbExtra: TmdbExtra = tmdb
      ? {
          genres: tmdb.genres,
          overview: tmdb.overview,
          recommendations: tmdb.recommendations,
          director: tmdb.director,
        }
      : {};

    const data = {
      tmdb_id,
      title,
      release_date,
      last_air_date,
      poster_path,
      media_type,
      ...tmdbExtra,
      id: savedId,
      watchStatus,
      watched_date,
      rating,
      review,
    } satisfies SavedMedia;
    return { data, error: null, initialStep };
  }

  if (tmdb) return { data: tmdb, error: null, initialStep };
  return { data: null, error: tmdbError, initialStep };
}
