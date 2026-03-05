'use client';

import MovieDetailWrapper from '@/components/MovieDetailWrapper';
import UserEntryForm from '@/components/UserEntryForm';
import { useDetailStep } from '@/hooks/useDetailStep';
import { useIsTablet } from '@/hooks/useIsTablet';
import { Movie, SavedMovie } from '@/types';
import { useRouter } from 'next/navigation';
import MovieInfo from './MovieInfo';
import WatchedMovieInfo from './WatchedMovieInfo';

type Props = {
  movie: Movie | SavedMovie;
  initialStep?: number;
};

export default function MovieDetail({ movie, initialStep = 1 }: Props) {
  const { step, goToForm, goToInfo } = useDetailStep(initialStep);
  const isTablet = useIsTablet();
  const router = useRouter();

  const isSaved = 'status' in movie;
  const saved = isSaved ? (movie as SavedMovie) : null;
  const status = saved?.status;
  const userMovieId = saved?.userMovieId;

  const handleUpdateSuccess = () => {
    router.refresh();
    goToInfo();
  };

  const handleMoveToWatchedSuccess = () => {
    router.push(`/my-movies?tab=watched`);
  };

  const onUpdateSuccess = !isSaved
    ? undefined
    : status === 'watched'
      ? handleUpdateSuccess
      : handleMoveToWatchedSuccess;

  const infoSlot =
    status === 'watched' ? (
      <WatchedMovieInfo
        movie={movie}
        userEntry={{
          watched_date: saved!.watched_date,
          rating: saved!.rating,
          review: saved!.review,
        }}
        onEdit={goToForm}
        isTablet={isTablet}
      />
    ) : (
      <MovieInfo
        movie={movie}
        userMovieId={userMovieId}
        isToWatch={status === 'to_watch'}
        addToWatched={goToForm}
        isTablet={isTablet}
      />
    );

  const formSlot = (
    <UserEntryForm
      movie={movie}
      userMovieId={userMovieId}
      initialData={
        status === 'watched'
          ? {
              watched_date: saved!.watched_date,
              rating: saved!.rating,
              review: saved!.review,
              status: 'watched',
            }
          : undefined
      }
      onUpdateSuccess={onUpdateSuccess}
    />
  );

  return (
    <MovieDetailWrapper
      posterPath={movie.poster_path}
      posterTitle={movie.title}
      step={step}
      isTablet={isTablet}
      className="h-full-screen"
      infoSlot={infoSlot}
      formSlot={formSlot}
    />
  );
}
