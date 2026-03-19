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
    const { id, status, watched_date, rating, review, media } = userMedia;
    const { tmdb_id, title, release_date, last_air_date, poster_path, director, media_type } =
      media;
    const data = {
      tmdb_id,
      title,
      release_date,
      last_air_date,
      poster_path,
      director,
      media_type,
      id,
      status,
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
