'use client';

import UserEntryForm from '@/app/(movies)/UserEntryForm';
import MediaDetailWrapper from '@/components/MediaDetailWrapper';
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
  const isSaved = 'watchStatus' in media;
  const saved = isSaved ? (media as SavedMedia) : null;
  const watchStatus = saved?.watchStatus;
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
    : watchStatus === 'watched'
      ? handleUpdateSuccess
      : handleMoveToWatchedSuccess;

  const infoSlot =
    watchStatus === 'watched' ? (
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
        isToWatch={watchStatus === 'to_watch'}
        addToWatched={goToForm}
        isTablet={isTablet}
      />
    );

  const formSlot = (
    <UserEntryForm
      media={media}
      userMediaId={userMediaId}
      initialData={
        watchStatus === 'watched'
          ? {
              watched_date: saved!.watched_date,
              rating: saved!.rating,
              review: saved!.review,
              watchStatus: 'watched',
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
