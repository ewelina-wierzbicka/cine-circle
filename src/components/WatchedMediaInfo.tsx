'use client';

import MediaInfoHeader from '@/components/MediaInfoHeader';
import StarRating from '@/components/StarRating';
import { deleteUserMedia } from '@/services/deleteUserMedia';
import { NormalizedMedia, UserEntry } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Button from './Button';

type Props = {
  media: NormalizedMedia;
  userMediaId: number;
  userEntry: Pick<UserEntry, 'watched_date' | 'rating' | 'review'>;
  onEdit: () => void;
};

export default function WatchedMediaInfo({
  media,
  userMediaId,
  userEntry,
  onEdit,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const { watched_date, rating, review } = userEntry;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserMedia(userMediaId);
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      router.push('/my-media?tab=watched');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to delete. Please try again.',
      );
      setIsDeleting(false);
    }
  };

  const formattedDate = watched_date
    ? new Date(watched_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col w-full animate-fade-up max-w-full md:max-w-120">
      <MediaInfoHeader media={media} />
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
        <Button handleClick={onEdit} className="flex-1">
          UPDATE
        </Button>
        <Button
          variant="outlined"
          handleClick={handleDelete}
          disabled={isDeleting}
          className="flex-1"
        >
          {isDeleting ? 'DELETING…' : 'DELETE'}
        </Button>
      </div>
    </div>
  );
}
