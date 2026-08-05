import { createClient } from '@/lib/supabase/server';
import { getUserMedia } from '@/services/getUserMedia';
import { MediaType, NormalizedMedia, SavedMedia } from '@/types';

export const getEnrichedMedia = async (
  baseMedia: NormalizedMedia,
  tmdbId: number,
  mediaType: MediaType,
): Promise<{
  media: NormalizedMedia | SavedMedia;
  isAuthenticated: boolean;
}> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  if (!user) return { media: baseMedia, isAuthenticated };

  const userMedia = await getUserMedia(tmdbId, mediaType, user.id).catch(
    (err: unknown) => {
      if ((err as { code?: string }).code === 'PGRST116') return null;
      throw err;
    },
  );

  if (!userMedia) return { media: baseMedia, isAuthenticated };

  const {
    id: savedId,
    watchStatus,
    watched_date,
    rating,
    review,
    media: savedMedia,
  } = userMedia;
  const {
    tmdb_id,
    title,
    release_date,
    last_air_date,
    poster_path,
    media_type: savedMediaType,
  } = savedMedia;

  const media: SavedMedia = {
    tmdb_id,
    title,
    release_date,
    last_air_date,
    poster_path,
    media_type: savedMediaType,
    genres: baseMedia.genres,
    overview: baseMedia.overview,
    recommendations: baseMedia.recommendations,
    director: baseMedia.director,
    id: savedId,
    watchStatus,
    watched_date,
    rating,
    review,
  };

  return { media, isAuthenticated };
};
