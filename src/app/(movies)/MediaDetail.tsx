'use client';

import MediaDetailWrapper from '@/components/MediaDetailWrapper';
import UserEntryForm from '@/components/UserEntryForm';
import { useDetailStep } from '@/hooks/useDetailStep';
import { useIsTablet } from '@/hooks/useIsTablet';
import { NormalizedMedia, SavedMedia } from '@/types';
import { useRouter } from 'next/navigation';
import MediaInfo from './MediaInfo';
import WatchedMediaInfo from './WatchedMediaInfo';

type Props = {
  media: NormalizedMedia | SavedMedia;
  initialStep?: number;
};

export default function MediaDetail({ media, initialStep = 1 }: Props) {
  const { step, goToForm, goToInfo } = useDetailStep(initialStep);
  const isTablet = useIsTablet();
  const router = useRouter();
  const isSaved = 'status' in media;
  const saved = isSaved ? (media as SavedMedia) : null;
  const status = saved?.status;
  const userMediaId = saved?.id;

  const handleUpdateSuccess = () => {
    router.refresh();
    goToInfo();
  };

  const handleMoveToWatchedSuccess = () => {
    router.push(`/my-media?tab=watched`);
  };

  const onUpdateSuccess = !isSaved
    ? undefined
    : status === 'watched'
      ? handleUpdateSuccess
      : handleMoveToWatchedSuccess;

  const infoSlot =
    status === 'watched' ? (
      <WatchedMediaInfo
        media={media}
        userEntry={{
          watched_date: saved!.watched_date,
          rating: saved!.rating,
          review: saved!.review,
        }}
        onEdit={goToForm}
        isTablet={isTablet}
      />
    ) : (
      <MediaInfo
        media={media}
        userMediaId={userMediaId}
        isToWatch={status === 'to_watch'}
        addToWatched={goToForm}
        isTablet={isTablet}
      />
    );

  const formSlot = (
    <UserEntryForm
      media={media}
      userMediaId={userMediaId}
      initialData={
        status === 'watched'
          ? {
              watched_date: saved!.watched_date,
              rating: saved!.rating,
              review: saved!.review,
              status: 'watched',
            }
          : undefined
      }
      onUpdateSuccess={onUpdateSuccess}
    />
  );

  return (
    <MediaDetailWrapper
      posterPath={media.poster_path}
      posterTitle={media.title}
      step={step}
      isTablet={isTablet}
      className="h-full-screen"
      infoSlot={infoSlot}
      formSlot={formSlot}
    />
  );
}
