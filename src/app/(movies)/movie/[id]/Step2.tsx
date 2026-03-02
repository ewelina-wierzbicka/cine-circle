'use client';

import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { addUserMovie } from '@/services/addUserMovie';
import { Movie, SavedWatchedMovieUserEntry } from '@/types';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type Props = {
  movie: Movie;
};

const Step2: FC<Props> = ({ movie }) => {
  const { id, title, release_date, poster_path, director } = movie;
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } =
    useForm<SavedWatchedMovieUserEntry>();
  const selectedDate = watch('watched_date');

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: SavedWatchedMovieUserEntry) => {
    const { rating, review, watched_date } = data;

    const normalizedRating = typeof rating !== 'number' ? undefined : rating;

    setIsSaving(true);
    try {
      await addUserMovie(
        {
          tmdb_id: id,
          title,
          release_date,
          poster_path,
          director,
        },
        {
          status: 'watched',
          watched_date,
          rating: normalizedRating,
          review,
        },
      );
      toast.success(`"${title}" was saved to your "watched" list!`);
      router.push('/my-movies?tab=watched');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to save. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full lg:w-2/5 h-full mx-auto flex flex-col justify-between"
    >
      <p className="text-2xl lg:text-3xl text-center">
        Adding <span className="font-bold">&quot;{title}&quot;</span>{' '}
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
              {...register('rating')}
            />
          </div>
        </div>
        <div>
          <label htmlFor="review">Any thoughts?</label>
          <Textarea
            id="review"
            {...register('review')}
            className="mt-3 lg:mt-6"
          />
        </div>
      </div>
      <Button
        type="submit"
        text={isSaving ? 'SAVING...' : 'SAVE'}
        size="small"
        disabled={isSaving}
      />
    </form>
  );
};

export default Step2;
