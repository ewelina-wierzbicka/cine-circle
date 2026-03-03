'use client';

import MovieDetailWrapper from '@/components/MovieDetailWrapper';
import UserEntryForm from '@/components/UserEntryForm';
import { useDetailStep } from '@/hooks/useDetailStep';
import { Movie, UserMovie } from '@/types';
import { useRouter } from 'next/navigation';
import WatchedMovieInfo from './WatchedMovieInfo';

type Props = {
  userMovie: UserMovie;
};

export default function WatchedMovieDetail({ userMovie }: Props) {
  const { step, isTablet, goToForm, goToInfo } = useDetailStep();
  const router = useRouter();

  const {
    movie: { tmdb_id, title, release_date, poster_path, director },
    id: userMovieId,
    watched_date,
    rating,
    review,
  } = userMovie;

  const movieInfo: Movie = {
    id: tmdb_id,
    title,
    release_date,
    poster_path,
    director,
  };

  const handleUpdateSuccess = () => {
    router.refresh();
    goToInfo();
  };

  return (
    <MovieDetailWrapper
      posterPath={poster_path}
      posterTitle={title}
      step={step}
      isTablet={isTablet}
      infoSlot={
        <WatchedMovieInfo
          movie={movieInfo}
          userEntry={{ watched_date, rating, review }}
          onEdit={goToForm}
          isTablet={isTablet}
        />
      }
      formSlot={
        <UserEntryForm
          movie={movieInfo}
          userMovieId={userMovieId}
          initialData={{ watched_date, rating, review, status: 'watched' }}
          onUpdateSuccess={handleUpdateSuccess}
        />
      }
    />
  );
}
