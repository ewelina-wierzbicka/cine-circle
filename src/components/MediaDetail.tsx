'use client';

import UserEntryForm from '@/components/UserEntryForm';
import MediaDetailWrapper from '@/components/MediaDetailWrapper';
import { useDetailStep } from '@/hooks/useDetailStep';
import { NormalizedMedia, SavedMedia } from '@/types';
import { useRouter } from 'next/navigation';
import MediaInfo from './MediaInfo';
import WatchedMediaInfo from './WatchedMediaInfo';

type Props = {
  media: NormalizedMedia | SavedMedia;
  initialStep?: number;
  isAuthenticated?: boolean;
};

export default function MediaDetail({
  media,
  initialStep = 1,
  isAuthenticated = false,
}: Props) {
  const { step, goToForm, goToInfo } = useDetailStep(initialStep);
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
    router.push(`/collection?tab=watched`);
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
        userMediaId={userMediaId!}
        userEntry={{
          watched_date: saved!.watched_date,
          rating: saved!.rating,
          review: saved!.review,
        }}
        onEdit={goToForm}
      />
    ) : (
      <MediaInfo
        media={media}
        userMediaId={userMediaId}
        isToWatch={watchStatus === 'to_watch'}
        addToWatched={goToForm}
        isAuthenticated={isAuthenticated}
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
      posterSrc={
        media.poster_path
          ? `https://image.tmdb.org/t/p/w780${media.poster_path}`
          : undefined
      }
      posterTitle={media.title}
      step={step}
      infoSlot={infoSlot}
      formSlot={formSlot}
      recommendations={media.recommendations}
    />
  );
}
