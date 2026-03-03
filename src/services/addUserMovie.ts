'use server';

import { createClient } from '@/lib/supabase/server';
import { SavedMovieDetails, SavedMovieUserEntry } from '@/types';

export const addUserMovie = async (
  details: SavedMovieDetails,
  userEntry: SavedMovieUserEntry,
) => {
  const { tmdb_id, title, release_date, poster_path, director } = details;
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

  const { data: movie, error: movieError } = await supabase
    .from('movies')
    .upsert(
      {
        tmdb_id,
        title,
        release_date,
        poster_path,
        director,
      },
      { onConflict: 'tmdb_id' },
    )
    .select('id')
    .single();

  if (movieError) throw movieError;

  const { error: entryError } = await supabase.from('user_movies').insert({
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    movie_id: movie.id,
    status,
    watched_date,
    rating,
    review,
  });

  if (entryError) throw entryError;
};

export const updateUserMovie = async (
  id: number,
  entry: SavedMovieUserEntry,
): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // if (userError || !user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_movies')
    .update(entry)
    .eq('id', id);
  // .eq('user_id', user.id);

  if (error) throw error;
};
