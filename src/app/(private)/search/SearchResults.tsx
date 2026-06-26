'use client';

import Loader from '@/components/Loader';
import MediaList from '@/components/MediaList';
import { useCollectionStatus } from '@/hooks/useCollectionStatus';
import { SearchMediaResponse, useGetMedia } from '@/hooks/useGetMedia';
import { toSearchMediaListProps } from '@/lib/mediaUtils';
import { FilterMediaType } from '@/types';
import { useEffect, useMemo } from 'react';
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
};

export default function SearchResults({ query, type, initialData }: Props) {
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
      toast.error((error as Error).message);
    }
  }, [error]);

  const allMedia = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  const collectionItems = useMemo(
    () => allMedia.map((m) => ({ tmdbId: m.id, mediaType: m.media_type })),
    [allMedia],
  );
  const { data: statusMap } = useCollectionStatus(collectionItems);

  const enrichedMedia = useMemo(() => {
    return allMedia.map((media) => {
      const base = toSearchMediaListProps(media);
      const status = statusMap?.get(`${media.id}-${media.media_type}`);
      if (!status) return base;
      return {
        ...base,
        tmdb_id: media.id,
        id: status.userMediaId,
        watchStatus: status.watchStatus,
      };
    });
  }, [allMedia, statusMap]);

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MediaList
        media={enrichedMedia}
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
