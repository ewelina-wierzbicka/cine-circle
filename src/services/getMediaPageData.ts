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
  isAuthenticated = false,
): Promise<MediaPageData> {
  const id = slug.split('-')[0];
  const tmdbId = Number(id);
  const initialStep = stepParam === '2' ? 2 : 1;

  // TMDB details are needed whether or not the user has saved this media:
  // saved rows enrich TMDB extras; unsaved rows return the full detail.
  // Kick the fetch off immediately so it runs in parallel with Supabase.
  const tmdbPromise: Promise<NormalizedMedia> =
    mediaType === 'series' ? getSeriesDetails(id) : getMovieDetails(id);

  // Only hit Supabase when authenticated. Mirror the original behaviour:
  // a not-found row (PGRST116) is treated as "not saved" rather than an error.
  const userMediaPromise: Promise<UserMedia | null> = isAuthenticated
    ? getUserMedia(tmdbId, mediaType).catch((err) => {
        const isNotFound = (err as { code?: string }).code === 'PGRST116';
        if (isNotFound) return null;
        throw err;
      })
    : Promise.resolve(null);

  let userMedia: UserMedia | null = null;
  let error: string | null = null;

  if (isAuthenticated) {
    try {
      userMedia = await userMediaPromise;
    } catch (err) {
      error = (err as Error).message || 'Failed to load saved data.';
    }
  }

  // Preserve prior behaviour: a hard Supabase error short-circuits even if
  // TMDB would have succeeded.
  if (error) {
    return { data: null, error, initialStep };
  }

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

    let tmdbExtra: TmdbExtra = {};
    try {
      const tmdb = await tmdbPromise;
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
      id: savedId,
      watchStatus,
      watched_date,
      rating,
      review,
    } satisfies SavedMedia;
    return { data, error: null, initialStep };
  }

  try {
    const data = await tmdbPromise;
    return { data, error: null, initialStep };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || 'Failed to load data.',
      initialStep,
    };
  }
}
