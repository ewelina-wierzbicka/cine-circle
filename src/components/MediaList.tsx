'use client';

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
      <div className="flex items-center justify-center h-48 w-full">
        <p className="font-mono text-sm tracking-[0.12em] text-secondary uppercase">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {heading && <div className="mb-8">{heading}</div>}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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
      <div ref={loadMoreRef} className="w-full pt-12" />
      {isFetchingNextPage && <Loader />}
    </div>
  );
}
