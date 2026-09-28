'use client';

import UserEntryFormSkeleton from '@/components/UserEntryFormSkeleton';
import { useDetailStep } from '@/hooks/useDetailStep';
import { NormalizedMedia, SavedMedia } from '@/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const UserEntryForm = dynamic(() => import('@/components/UserEntryForm'), {
  ssr: false,
  loading: () => <UserEntryFormSkeleton />,
});

type Props = {
  media: NormalizedMedia | SavedMedia;
};

// Step 2 of the detail page. Lives behind the same Suspense boundary as
// `MediaActions` because the form is prefilled from the user's saved entry.
export default function MediaEntryForm({ media }: Props) {
  const { goToInfo } = useDetailStep();
  const router = useRouter();

  const saved = 'watchStatus' in media ? media : null;
  const watchStatus = saved?.watchStatus;

  const handleUpdateSuccess = () => {
    router.refresh();
    goToInfo();
  };

  const handleMoveToWatchedSuccess = () => {
    router.push(`/collection?tab=watched`);
  };

  const onUpdateSuccess = !saved
    ? undefined
    : watchStatus === 'watched'
      ? handleUpdateSuccess
      : handleMoveToWatchedSuccess;

  return (
    <UserEntryForm
      media={media}
      userMediaId={saved?.id}
      initialData={
        saved && watchStatus === 'watched'
          ? {
              watched_date: saved.watched_date,
              rating: saved.rating,
              review: saved.review,
              watchStatus: 'watched',
            }
          : undefined
      }
      onUpdateSuccess={onUpdateSuccess}
    />
  );
}
