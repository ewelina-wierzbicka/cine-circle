'use server';

import { createClient } from '@/lib/supabase/server';
import { NormalizedMedia, UserEntry } from '@/types';

export const addUserMedia = async (
  details: NormalizedMedia,
  userEntry: UserEntry,
) => {
  const {
    id: tmdb_id,
    title,
    release_date,
    last_air_date,
    poster_path,
    director,
    media_type,
  } = details;
  const { status } = userEntry;
  const { watched_date, rating, review } =
    userEntry.status === 'watched'
      ? userEntry
      : { watched_date: undefined, rating: undefined, review: undefined };
  const supabase = await createClient();

  // const {
  //   data: { user },
  //   error: userError,
  // } = await supabase.auth.getUser();

  // if (userError || !user) throw new Error('Not authenticated');

  const { data: media, error: mediaError } = await supabase
    .from('media')
    .upsert(
      {
        tmdb_id,
        title,
        release_date,
        last_air_date,
        poster_path,
        director,
        media_type,
      },
      { onConflict: 'tmdb_id,media_type' },
    )
    .select('id')
    .single();

  if (mediaError) throw mediaError;

  const { error: entryError } = await supabase.from('user_media').insert({
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    media_id: media.id,
    status,
    watched_date,
    rating,
    review,
  });

  if (entryError) throw entryError;
};

export const updateUserMedia = async (
  id: number,
  entry: UserEntry,
): Promise<void> => {
  const supabase = await createClient();

  // const {
  // data: { user },
  // error: userError,
  // } = await supabase.auth.getUser();

  // if (userError || !user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_media')
    .update(entry)
    .eq('id', id);
  // .eq('user_id', user.id);

  if (error) throw error;
};
