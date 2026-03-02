'use client';

import Loader from '@/components/Loader';
import MovieList from '@/components/MovieList';
import { toSearchMovieListProps } from '@/lib/movieUtils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const fetchMovies = async ({ pageParam = 1 }: { pageParam: number }) => {
    const res = await fetch(`/api/search?query=${query}&page=${pageParam}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to fetch');
    }
    return res.json();
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', query],
    queryFn: fetchMovies,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: query?.length > 0,
  });

  useEffect(() => {
    if (error) {
      toast.error((error as Error).message);
    }
  }, [error]);

  const allMovies = data?.pages.flatMap((page) => page.results) || [];

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MovieList
        movies={allMovies.map(toSearchMovieListProps)}
        heading={
          <>
            Search results for:{' '}
            <span className="font-bold">&quot;{query}&quot;</span>
          </>
        }
        emptyMessage={`No movies found for: "${query}"`}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
}
