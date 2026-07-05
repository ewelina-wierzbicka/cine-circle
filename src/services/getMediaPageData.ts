import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getUserMedia } from '@/services/getUserMedia';
import { NormalizedMedia, SavedMedia } from '@/types';

type MediaPageData = {
  data: SavedMedia | NormalizedMedia | null;
  error: string | null;
  initialStep: number;
};

export async function getMediaPageData(
  slug: string,
  mediaType: 'movie' | 'series',
  stepParam?: string,
): Promise<MediaPageData> {
  const id = slug.split('-')[0];
  const tmdbId = Number(id);
  const initialStep = stepParam === '2' ? 2 : 1;

  let error: string | null = null;
  let userMedia = null;

  try {
    userMedia = await getUserMedia(tmdbId, mediaType);
  } catch (err) {
    const isNotFound = (err as { code?: string }).code === 'PGRST116';
    if (!isNotFound) {
      error = (err as Error).message || 'Failed to load saved data.';
    }
  }

  if (userMedia) {
    const { id, watchStatus, watched_date, rating, review, media } = userMedia;
    const {
      tmdb_id,
      title,
      release_date,
      last_air_date,
      poster_path,
      media_type,
    } = media;

    // Supabase media table doesn't store genres/overview/recommendations/director — fetch from TMDB
    let tmdbExtra: Pick<
      NormalizedMedia,
      'genres' | 'overview' | 'recommendations' | 'director'
    > = {};
    try {
      const tmdb =
        mediaType === 'series'
          ? await getSeriesDetails(tmdb_id.toString())
          : await getMovieDetails(tmdb_id.toString());
      tmdbExtra = {
        genres: tmdb.genres,
        overview: tmdb.overview,
        recommendations: tmdb.recommendations,
        director: tmdb.director,
      };
    } catch {
      // non-fatal: detail page still works without these fields
    }

    const data = {
      tmdb_id,
      title,
      release_date,
      last_air_date,
      poster_path,
      media_type,
      ...tmdbExtra,
      id,
      watchStatus,
      watched_date,
      rating,
      review,
    } satisfies SavedMedia;
    return { data, error: null, initialStep };
  }

  if (error) {
    return { data: null, error, initialStep };
  }

  try {
    const data =
      mediaType === 'series'
        ? await getSeriesDetails(id)
        : await getMovieDetails(id);
    return { data, error: null, initialStep };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || 'Failed to load data.',
      initialStep,
    };
  }
}
