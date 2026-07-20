'use client';

import Loader from '@/components/Loader';
import MediaList from '@/components/MediaList';
import { SearchMediaResponse, useGetMedia } from '@/hooks/useGetMedia';
import { toSearchMediaListProps } from '@/lib/mediaUtils';
import { FilterMediaType } from '@/types';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const TYPE_LABELS: Record<FilterMediaType, string> = {
  movie: 'movies',
  series: 'series',
  all: 'movies & series',
};

type Props = {
  query: string;
  type: FilterMediaType;
  initialData: SearchMediaResponse | null;
  isAuthenticated: boolean;
};

export default function SearchResults({
  query,
  type,
  initialData,
  isAuthenticated,
}: Props) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMedia({
    query,
    type,
    initialData,
  });

  useEffect(() => {
    if (error) {
      const message = (error as Error).message;
      toast.error(message, { toastId: message });
    }
  }, [error]);

  const allMedia = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MediaList
        media={allMedia.map(toSearchMediaListProps)}
        isAuthenticated={isAuthenticated}
        heading={
          <div>
            <p className="font-mono text-sm tracking-[0.2em] text-mint uppercase mb-2">
              Search Results
            </p>
            <p className="font-serif text-[clamp(24px,3.5vw,38px)] tracking-[-0.02em] leading-none">
              &ldquo;{query}&rdquo;{' '}
              <span className="text-secondary text-xl font-sans">
                {TYPE_LABELS[type]}
              </span>
            </p>
          </div>
        }
        emptyMessage={`No ${TYPE_LABELS[type]} found for: "${query}"`}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
}
