import Button from '@/components/Button';
import { Movie } from '@/types';
import { FC } from 'react';

type Props = {
  movie: Movie;
  addToWatched: () => void;
  isTablet: boolean;
};

const Step1: FC<Props> = ({ movie, addToWatched, isTablet }) => {
  const addToToWatch = () => {
    console.log('add to to watch');
  };

  return (
    <div className="flex flex-col w-full h-1/2 md:h-full -mt-30 md:mt-0 z-50">
      <p
        className={`${movie.title.length > 40 ? 'text-4xl' : 'text-5xl'} sm:text-5xl font-bold uppercase`}
      >
        {movie.title}
      </p>
      <p className="text-sm text-secondary mt-8 pt-2 border-t border-primary min-w-40 lg:min-w-40 w-max max-w-full">
        dir: {movie.director}
      </p>
      <p className="text-sm text-secondary mt-1">
        {movie.release_date?.slice(0, 4)}
      </p>
      <div className="w-full sm:w-3/4 flex justify-center flex-col h-full mx-auto align-self-end">
        <Button
          text="I want to watch"
          variant="primary"
          size={isTablet ? 'small' : 'medium'}
          className="mb-4 lg:mb-10"
          handleClick={addToToWatch}
        />
        <Button
          text="I watched"
          variant="secondary"
          size={isTablet ? 'small' : 'medium'}
          handleClick={addToWatched}
        />
      </div>
    </div>
  );
};

export default Step1;
