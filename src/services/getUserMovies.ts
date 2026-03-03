import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { UserMovie, UserMoviesPage } from '@/types';

export const getUserMovies = async (
  status?: 'watched' | 'to_watch',
  page = 0,
): Promise<UserMoviesPage> => {
  const supabase = await createClient();

  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   if (!user) throw new Error('Not authenticated');

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('user_movies')
    .select('*, movie:movies(*)')
    // .eq('user_id', user.id)
    .order('added_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    movies: data as UserMovie[],
    nextPage: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

export const getUserMovie = async (tmdbId: number): Promise<UserMovie> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_movies')
    .select('*, movie:movies!inner(*)')
    .eq('movies.tmdb_id', tmdbId)
    .single();

  if (error) throw error;

  return data as UserMovie;
};
