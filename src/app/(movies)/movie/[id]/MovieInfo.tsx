'use client';

import Button from '@/components/Button';
import { addUserMovie } from '@/services/addUserMovie';
import { Movie } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  movie: Movie;
  addToWatched: () => void;
  isTablet: boolean;
};

export default function MovieInfo({ movie, addToWatched, isTablet }: Props) {
  const { id, title, release_date, poster_path, director } = movie;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const addToToWatch = async () => {
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
          status: 'to_watch',
        },
      );
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      toast.success(`"${title}" was saved to your "to watch" list!`);
      router.push('/my-movies?tab=to_watch');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to save. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-1/2 md:h-full -mt-30 md:mt-0 z-50">
      <p
        className={`${title.length > 35 ? 'text-4xl' : 'text-5xl'} sm:text-5xl font-bold uppercase`}
      >
        {title}
      </p>
      <p className="text-sm text-secondary mt-8 pt-2 border-t border-primary min-w-40 lg:min-w-40 w-max max-w-full">
        dir.: {director}
      </p>
      <p className="text-sm text-secondary mt-1">{releaseYear}</p>
      <div className="w-full sm:w-3/4 flex justify-center flex-col h-full mx-auto align-self-end">
        <Button
          text={isSaving ? 'SAVING...' : 'I WANT TO WATCH'}
          disabled={isSaving}
          size={isTablet ? 'small' : 'medium'}
          className="mb-4 lg:mb-10"
          handleClick={addToToWatch}
        />
        <Button
          text="I WATCHED"
          variant="secondary"
          size={isTablet ? 'small' : 'medium'}
          handleClick={addToWatched}
        />
      </div>
    </div>
  );
}
