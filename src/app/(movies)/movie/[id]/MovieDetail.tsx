'use client';

import MovieDetailWrapper from '@/components/MovieDetailWrapper';
import UserEntryForm from '@/components/UserEntryForm';
import { useDetailStep } from '@/hooks/useDetailStep';
import { Movie } from '@/types';
import MovieInfo from './MovieInfo';

type Props = {
  movie: Movie;
};

export default function MovieDetail({ movie }: Props) {
  const { step, isTablet, goToForm } = useDetailStep();

  return (
    <MovieDetailWrapper
      posterPath={movie.poster_path}
      posterTitle={movie.title}
      step={step}
      isTablet={isTablet}
      className="h-full-screen"
      infoSlot={
        <MovieInfo movie={movie} addToWatched={goToForm} isTablet={isTablet} />
      }
      formSlot={<UserEntryForm movie={movie} />}
    />
  );
}
