'use client';

import Loader from '@/components/Loader';
import { Movie } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchMovies = async ({ pageParam = 1 }) => {
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

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '300px',
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    if (error) {
      toast.error((error as Error).message);
    }
  }, [error]);

  const allMovies = data?.pages.flatMap((page) => page.results) || [];

  return (
    <div className="w-full">
      {isLoading && <Loader fullScreen={true} />}
      {allMovies.length > 0 ? (
        <div className="mt-4 border border-primary rounded-3xl px-4 lg:px-14 py-14">
          <div className="mb-10 border-b border-primary min-w-50 lg:min-w-100 w-max max-w-full -ml-4 lg:-ml-14">
            <p className="text-base md:text-xl ml-4 lg:ml-14">
              Search results for:{' '}
              <span className="font-bold">&quot;{query}&quot;</span>
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-8">
            {allMovies.map((movie: Movie, index: number) => (
              <div
                key={`${movie.id}`}
                className="w-full flex flex-col justify-end"
              >
                <p className="text-sm md:text-base uppercase font-semibold w-full">
                  {movie.title}
                </p>
                <p className="text-xs text-secondary mt-1">
                  {movie.release_date?.slice(0, 4) || 'N/A'}
                </p>
                <div className="w-fill aspect-3/4 relative mt-2">
                  <Image
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'top center',
                    }}
                    fill={true}
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                        : '/no-image.jpg'
                    }
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                    alt={movie.title}
                    priority={index < 12}
                  />
                </div>
              </div>
            ))}
          </div>
          <div ref={loadMoreRef} className="w-full pt-16" />
          {isFetchingNextPage && <Loader />}
        </div>
      ) : (
        <div
          className={`flex items-center justify-center h-full-screen w-full`}
        >
          <p className="text-xl">
            No movies found for:{' '}
            <span className="font-bold block md:inline">
              &quot;{query}&quot;
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
