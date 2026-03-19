'use client';

import BorderContainer from '@/components/BorderContainer';
import Loader from '@/components/Loader';
import { NormalizedMedia, SavedMedia } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import MediaCard from './MediaCard';

type Props = {
  media: ((SavedMedia | NormalizedMedia) & { href: string })[];
  heading?: React.ReactNode;
  emptyMessage?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
};

export default function MediaList({
  media,
  heading,
  emptyMessage = 'No movies found',
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
}: Props) {
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
    return () => observer.disconnect();
  }, [handleObserver]);

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-320px)] lg:h-[calc(100vh-248px)] w-full">
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
        {media.map((item, index) => {
          const tmdbId = 'tmdb_id' in item ? item.tmdb_id : item.id;
          const userMediaId = 'tmdb_id' in item ? item.id : undefined;
          return (
            <MediaCard
              key={`${item.media_type}-${tmdbId}`}
              media={item}
              priority={index < 12}
              userMediaId={userMediaId}
            />
          );
        })}
      </div>
      <div ref={loadMoreRef} className="w-full pt-16" />
      {isFetchingNextPage && <Loader />}
    </BorderContainer>
  );
}
