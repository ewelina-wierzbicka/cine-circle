'use client';

import DatePicker from '@/components/DatePicker';
import StarRatingInput from '@/components/StarRatingInput';
import Textarea from '@/components/Textarea';
import { addUserMedia, updateUserMedia } from '@/services/addUserMedia';
import { NormalizedMedia, UserEntry } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from './Button';

type Props = {
  media: NormalizedMedia;
  userMediaId?: number;
  initialData?: UserEntry;
  onUpdateSuccess?: () => void;
};

export default function UserEntryForm({
  media,
  userMediaId,
  initialData,
  onUpdateSuccess,
}: Props) {
  const {
    id,
    title,
    release_date,
    last_air_date,
    poster_path,
    director,
    media_type,
  } = media;
  const { watched_date, rating, review } = initialData || {};
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserEntry>({
    defaultValues: {
      watched_date: watched_date,
      rating: rating,
      review: review,
    },
  });
  const selectedDate = watch('watched_date');

  const [isSaving, setIsSaving] = useState(false);

  const isUpdateMode = userMediaId !== undefined;

  const onSubmit = async (data: UserEntry) => {
    const { rating, review, watched_date } = data;
    const normalizedRating = rating === 0 ? null : (rating ?? undefined);

    setIsSaving(true);
    try {
      if (isUpdateMode) {
        await updateUserMedia(userMediaId, {
          watchStatus: 'watched',
          watched_date,
          rating: normalizedRating,
          review,
        });
        await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
        toast.success(`"${title}" was updated!`);
        onUpdateSuccess?.();
      } else {
        const result = await addUserMedia(
          {
            id,
            title,
            release_date,
            last_air_date,
            poster_path,
            director,
            media_type,
          },
          {
            watchStatus: 'watched',
            watched_date,
            rating: normalizedRating,
            review,
          },
        );
        if (result.status === 'duplicate') {
          toast.info(`"${title}" is already in your list.`);
        } else {
          toast.success(`"${title}" was saved to your "watched" list!`);
          await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
          router.push('/my-media?tab=watched');
        }
      }
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to save. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full py-4 animate-fade-up">
      <p className="font-serif text-[32px] lg:text-[48px] tracking-[-0.02em] leading-[1.1] mb-10">
        {isUpdateMode ? 'Update' : 'Add'}{' '}
        <em className="text-mint">&ldquo;{title}&rdquo;</em>
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-7 max-w-full md:max-w-120"
      >
        <div>
          <label
            htmlFor="watched_date"
            className="block font-mono text-sm tracking-[0.18em] text-secondary uppercase my-3"
          >
            When did you watch it?
          </label>
          <DatePicker
            id="watched_date"
            handleChange={(date) =>
              setValue('watched_date', date?.toISOString().split('T')[0])
            }
            selected={selectedDate ? new Date(selectedDate) : undefined}
          />
        </div>
        <div>
          <label className="block font-mono text-sm tracking-[0.18em] text-secondary uppercase my-3">
            How did you like it?
          </label>
          <StarRatingInput
            value={watch('rating') ?? 0}
            onChange={(v) => setValue('rating', v)}
            error={errors.rating?.message}
          />
        </div>
        <div>
          <label
            htmlFor="review"
            className="block font-mono text-sm tracking-[0.18em] text-secondary uppercase my-3"
          >
            Any thoughts?
          </label>
          <Textarea
            id="review"
            {...register('review', {
              maxLength: {
                value: 1000,
                message: 'Please use up to 1000 characters.',
              },
            })}
            error={errors.review?.message}
          />
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'SAVING…' : isUpdateMode ? 'UPDATE' : 'SAVE'}
          </Button>
        </div>
      </form>
    </div>
  );
}
