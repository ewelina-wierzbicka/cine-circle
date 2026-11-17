'use client';

import Loader from '@/components/Loader';
import MediaList from '@/components/MediaList';
import { useUserMedia } from '@/hooks/useUserMedia';
import { toUserMediaListProps } from '@/lib/mediaUtils';
import {
  CollectionTab,
  FilterMediaType,
  RatingFilter,
  UserMediaPage,
} from '@/types';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type Props = {
  watchStatus: CollectionTab;
  initialData: UserMediaPage;
  searchQuery?: string;
  mediaType: FilterMediaType;
  rating: RatingFilter;
};

export default function UserMediaList({
  watchStatus,
  initialData,
  searchQuery = '',
  mediaType,
  rating,
}: Props) {
  const {
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useUserMedia(watchStatus, initialData, searchQuery, mediaType, rating);

  useEffect(() => {
    if (error) {
      const message = (error as Error).message;
      toast.error(message, { toastId: message });
    }
  }, [error]);

  const media = data?.pages.flatMap((page) => page.media) ?? [];

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MediaList
        media={media.map((entry) => toUserMediaListProps(entry, watchStatus))}
        emptyMessage="No entries added yet"
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
      />
    </>
  );
}
