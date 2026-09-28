'use client';

import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { useDetailStep } from '@/hooks/useDetailStep';
import { addUserMedia } from '@/services/addUserMedia';
import { deleteUserMedia } from '@/services/deleteUserMedia';
import { NormalizedMedia, SavedMedia } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  media: NormalizedMedia | SavedMedia;
  isAuthenticated?: boolean;
};

export default function MediaActions({
  media,
  isAuthenticated = false,
}: Props) {
  const { goToForm } = useDetailStep();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const saved = 'watchStatus' in media ? media : null;
  const watchStatus = saved?.watchStatus;
  const userMediaId = saved?.id;

  const addToToWatch = async () => {
    const { id, title, release_date, last_air_date, poster_path, media_type } =
      media;
    setIsSaving(true);
    try {
      const result = await addUserMedia(
        {
          id,
          title,
          release_date,
          last_air_date,
          poster_path,
          media_type,
        },
        { watchStatus: 'to_watch' },
      );
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      if (result.status === 'duplicate') {
        toast.info(`"${title}" is already in your list.`);
      } else {
        toast.success(`"${title}" saved to your "to watch" list!`);
        router.push('/collection?tab=to_watch');
      }
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to save. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userMediaId) return;
    const tab = watchStatus === 'watched' ? 'watched' : 'to_watch';
    setIsDeleting(true);
    try {
      await deleteUserMedia(userMediaId);
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      router.push(`/collection?tab=${tab}`);
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to delete. Please try again.',
      );
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 pt-3">
        <p className="font-mono text-sm text-secondary">
          Sign in to add to collection
        </p>
        <Button handleClick={() => router.push(`/login?rurl=${pathname}`)}>
          SIGN IN
        </Button>
      </div>
    );
  }

  if (saved && watchStatus === 'watched') {
    const { watched_date, rating, review } = saved;
    const formattedDate = watched_date
      ? new Date(watched_date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

    return (
      <>
        <div className="flex flex-col gap-8 mb-8">
          {rating != null && (
            <div>
              <p className="font-mono text-sm tracking-[0.18em] text-secondary uppercase mb-3">
                Your Rating
              </p>
              <div className="flex items-center gap-3">
                <StarRating rating={rating} />
                <span className="font-mono text-sm tracking-[0.06em] text-primary">
                  {rating}/10
                </span>
              </div>
            </div>
          )}
          {formattedDate && (
            <div>
              <p className="font-mono text-sm tracking-[0.18em] text-secondary uppercase mb-2">
                Watched
              </p>
              <p className="text-sm text-primary">{formattedDate}</p>
            </div>
          )}
          {review && (
            <div>
              <p className="font-mono text-sm tracking-[0.18em] text-secondary uppercase mb-2">
                Review
              </p>
              <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">
                {review}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2.5 flex-col md:flex-row">
          <Button handleClick={goToForm}>UPDATE</Button>
          <Button
            variant="outlined"
            handleClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'DELETING…' : 'DELETE'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="flex gap-2.5 flex-col md:flex-row">
      {watchStatus === 'to_watch' ? (
        <>
          <Button handleClick={goToForm} className="px-0">
            MOVE TO WATCHED
          </Button>
          <Button
            variant="outlined"
            handleClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'DELETING…' : 'DELETE'}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outlined"
            handleClick={addToToWatch}
            disabled={isSaving}
          >
            {isSaving ? 'SAVING…' : 'I WANT TO WATCH'}
          </Button>
          <Button handleClick={goToForm}>I WATCHED</Button>
        </>
      )}
    </div>
  );
}
