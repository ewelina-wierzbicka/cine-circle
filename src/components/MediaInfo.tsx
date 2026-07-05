'use client';

import Button from '@/components/Button';
import MediaInfoHeader from '@/components/MediaInfoHeader';
import { addUserMedia } from '@/services/addUserMedia';
import { deleteUserMedia } from '@/services/deleteUserMedia';
import { NormalizedMedia } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  media: NormalizedMedia;
  userMediaId?: number;
  isToWatch?: boolean;
  addToWatched: () => void;
};

export default function MediaInfo({
  media,
  userMediaId,
  isToWatch,
  addToWatched,
}: Props) {
  const { id, title, release_date, last_air_date, poster_path, media_type } =
    media;
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSearch = searchParams.get('from') === 'search';
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addToToWatch = async () => {
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
    setIsDeleting(true);
    try {
      await deleteUserMedia(userMediaId);
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      router.push('/collection?tab=to_watch');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to delete. Please try again.',
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-fade-up md:max-w-120">
      <MediaInfoHeader media={media} />
      <div className="flex gap-2.5 flex-col md:flex-row">
        {isToWatch ? (
          <>
            <Button handleClick={addToWatched} className="flex-1">
              MOVE TO WATCHED
            </Button>
            <Button
              variant="outlined"
              handleClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
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
              className="flex-1"
            >
              {isSaving ? 'SAVING…' : 'I WANT TO WATCH'}
            </Button>
            <Button handleClick={addToWatched} className="flex-1">
              I WATCHED
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
