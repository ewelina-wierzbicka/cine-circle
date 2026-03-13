'use client';

import Loader from '@/components/Loader';
import MediaList from '@/components/MediaList';
import { useUserMedia } from '@/hooks/useUserMedia';
import { toUserMediaListProps } from '@/lib/mediaUtils';
import { FilterMediaType, UserMediaPage } from '@/types';

type Props = {
  status: 'to_watch' | 'watched';
  initialData: UserMediaPage;
  searchQuery?: string;
  mediaType: FilterMediaType;
};

export default function UserMediaList({
  status,
  initialData,
  searchQuery = '',
  mediaType,
}: Props) {
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isLoading } =
    useUserMedia(status, initialData, searchQuery, mediaType);

  const media = data?.pages.flatMap((page) => page.media) ?? [];

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MediaList
        media={media.map(toUserMediaListProps)}
        emptyMessage="No entries added yet"
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        className="min-h-[calc(100vh-320px)] lg:min-h-[calc(100vh-248px)]"
      />
    </>
  );
}
