import { Movie, UserMovie } from '@/types';

export function toSearchMovieListProps(movie: Movie) {
  return {
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    href: `/movie/${movie.id}-${movie.title.toLowerCase()}`,
  };
}

export function toUserMovieListProps(userMovie: UserMovie) {
  const { movie } = userMovie;
  return {
    tmdb_id: movie.tmdb_id,
    title: movie.title,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    rating: userMovie.rating,
    status: userMovie.status,
    href: `/movie/${movie.id}-${movie.title.toLowerCase()}`,
  };
}
