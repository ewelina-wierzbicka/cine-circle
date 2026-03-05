import { Movie, UserMovie } from '@/types';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

export function toSearchMovieListProps(movie: Movie) {
  return {
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    href: `/movie/${movie.id}-${toSlug(movie.title)}`,
  };
}

export function toUserMovieListProps(userMovie: UserMovie) {
  const { movie } = userMovie;
  const href = `/movie/${movie.tmdb_id}-${toSlug(movie.title)}`;
  return {
    id: movie.tmdb_id,
    title: movie.title,
    release_date: movie.release_date,
    poster_path: movie.poster_path,
    rating: userMovie.rating,
    status: userMovie.status,
    userMovieId: userMovie.id,
    href,
  };
}
