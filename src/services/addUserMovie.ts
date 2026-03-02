import { createClient } from '@/lib/supabase/client';
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
  const supabase = createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) throw new Error('Not authenticated');

  // Step 1: upsert movie metadata — inserts if new, skips if already exists
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

  // Step 2: insert the user's personal entry referencing the movie
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
