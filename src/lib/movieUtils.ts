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
    id: movie.tmdb_id,
    title: movie.title,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    href: `/movie/${movie.tmdb_id}-${movie.title.toLowerCase()}`,
  };
}
