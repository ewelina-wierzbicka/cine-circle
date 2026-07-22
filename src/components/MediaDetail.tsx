'use client';

import MediaDetailWrapper from '@/components/MediaDetailWrapper';
import { useDetailStep } from '@/hooks/useDetailStep';
import { NormalizedMedia, SavedMedia } from '@/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import MediaInfo from './MediaInfo';
import WatchedMediaInfo from './WatchedMediaInfo';

const UserEntryForm = dynamic(() => import('@/components/UserEntryForm'), {
  ssr: false,
  loading: () => (
    <div className="w-full py-4 animate-fade-up">
      <div className="h-11 w-72 rounded-xl bg-bg3 mb-10" />
      <div className="flex flex-col gap-7 max-w-full md:max-w-140">
        <div>
          <div className="h-4 w-44 rounded bg-bg3 my-3" />
          <div className="h-11.5 rounded-xl bg-bg2" />
        </div>
        <div>
          <div className="h-4 w-36 rounded bg-bg3 my-3" />
          <div className="h-8 w-44 rounded bg-bg3" />
        </div>
        <div>
          <div className="h-4 w-28 rounded bg-bg3 my-3" />
          <div className="h-30 rounded-xl bg-bg2" />
        </div>
        <div className="pt-6">
          <div className="h-11 w-full rounded-xl bg-bg3" />
        </div>
      </div>
    </div>
  ),
});

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
