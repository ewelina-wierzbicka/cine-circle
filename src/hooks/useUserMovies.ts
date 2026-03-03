import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { UserMovie, UserMoviesPage } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchUserMoviesPage = async ({
  status,
  page,
  search,
}: {
  status?: 'watched' | 'to_watch';
  page: number;
  search?: string;
}): Promise<UserMoviesPage> => {
  const supabase = createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('user_movies')
    .select(`*, movie:movies${search ? '!inner' : ''}(*)`)
    .order('added_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('movies.title', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    movies: data as UserMovie[],
    nextPage: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

const BASE_STALE_TIME = 1000 * 60 * 2;
const SEARCH_STALE_TIME = 1000 * 30;

export const useUserMovies = (
  status?: 'watched' | 'to_watch',
  initialData?: UserMoviesPage,
  search?: string,
) => {
  const isSearch = !!search;

  return useInfiniteQuery({
    queryKey: ['user-movies', status, search],
    queryFn: ({ pageParam }) =>
      fetchUserMoviesPage({ status, page: pageParam, search }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData:
      !isSearch && initialData
        ? { pages: [initialData], pageParams: [0] }
        : undefined,
    staleTime: isSearch ? SEARCH_STALE_TIME : BASE_STALE_TIME,
  });
};
