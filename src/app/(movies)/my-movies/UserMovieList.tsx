'use client';

import Loader from '@/components/Loader';
import MovieList from '@/components/MovieList';
import { useUserMovies } from '@/hooks/useUserMovies';
import { toUserMovieListProps } from '@/lib/movieUtils';
import { UserMoviesPage } from '@/types';

type Props = {
  status: 'to_watch' | 'watched';
  initialData: UserMoviesPage;
  searchQuery?: string;
};

const UserMovieList = ({ status, initialData, searchQuery = '' }: Props) => {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading } =
    useUserMovies(status, initialData, searchQuery);

  const movies = data?.pages.flatMap((page) => page.movies) ?? [];

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MovieList
        movies={movies.map(toUserMovieListProps)}
        emptyMessage="No movies added yet"
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        className="min-h-[calc(100vh-320px)] lg:min-h-[calc(100vh-248px)]"
      />
    </>
  );
};

export default UserMovieList;
