'use client';

import BorderContainer from '@/components/BorderContainer';
import Loader from '@/components/Loader';
import { Movie } from '@/types';
import { FC, useCallback, useEffect, useRef } from 'react';
import MovieCard from './MovieCard';

type Props = {
  movies: (Movie & { href: string })[];
  heading?: React.ReactNode;
  emptyMessage?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
};

const MovieList: FC<Props> = ({
  movies,
  heading,
  emptyMessage = 'No movies found',
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage?.();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '300px',
      threshold: 0.1,
    });

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [handleObserver]);

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full-screen w-full">
        <p className="text-xl">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <BorderContainer className={className}>
      {heading && (
        <div className="mb-10 border-b border-primary min-w-50 lg:min-w-100 w-max max-w-full -ml-4 lg:-ml-14">
          <p className="text-base md:text-xl ml-4 lg:ml-14">{heading}</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-8">
        {movies.map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} priority={index < 12} />
        ))}
      </div>
      <div ref={loadMoreRef} className="w-full pt-16" />
      {isFetchingNextPage && <Loader />}
    </BorderContainer>
  );
};

export default MovieList;
