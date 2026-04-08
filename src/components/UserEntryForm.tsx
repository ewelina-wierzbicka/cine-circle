'use client';

import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { addUserMedia, updateUserMedia } from '@/services/addUserMedia';
import { NormalizedMedia, UserEntry } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

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
    const normalizedRating = !rating ? undefined : Number(rating);

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
    <div className="w-full h-[calc(100vh-240px)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full md:w-3/4 mx-auto h-full flex flex-col justify-between"
      >
        <p className="text-2xl lg:text-3xl text-center">
          {isUpdateMode ? 'Updating' : 'Adding'}
          <span className="font-bold">&quot;{title}&quot;</span>
        </p>
        <div className="flex gap-8 flex-col">
          <div>
            <label htmlFor="watched_date">When did you watch it?</label>
            <DatePicker
              id="watched_date"
              className="mt-3 lg:mt-6"
              handleChange={(date) =>
                setValue('watched_date', date?.toISOString().split('T')[0])
              }
              selected={selectedDate ? new Date(selectedDate) : undefined}
            />
          </div>
          <div>
            <label htmlFor="rating">How did you like it?</label>
            <div className="mt-3 lg:mt-6">
              <Input
                id="rating"
                variant="rating"
                type="number"
                {...register('rating', {
                  min: { value: 0, message: 'Rating must be at least 0' },
                  max: {
                    value: 10,
                    message: 'Rating cannot be greater than 10',
                  },
                })}
                error={errors.rating?.message}
              />
            </div>
          </div>
          <div>
            <label htmlFor="review">Any thoughts?</label>
            <Textarea
              id="review"
              {...register('review', {
                maxLength: {
                  value: 1000,
                  message: 'Please use up to 1000 characters.',
                },
              })}
              className="mt-3 lg:mt-6"
              error={errors.review?.message}
            />
          </div>
        </div>
        <Button
          type="submit"
          text={isSaving ? 'SAVING...' : isUpdateMode ? 'UPDATE' : 'SAVE'}
          size="small"
          disabled={isSaving}
        />
      </form>
    </div>
  );
}
