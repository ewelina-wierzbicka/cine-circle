export type Movie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  popularity?: number;
  director?: string;
};

export type SavedMovieDetails = {
  tmdb_id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  director?: string;
};

export type SavedWatchedMovieUserEntry = {
  status: 'watched';
  watched_date?: string;
  rating?: number;
  review?: string;
};

type SavedToWatchMovieUserEntry = {
  status: 'to_watch';
};

export type SavedMovieUserEntry =
  | SavedWatchedMovieUserEntry
  | SavedToWatchMovieUserEntry;

export type SavedMovieType = SavedMovieDetails & SavedMovieUserEntry;

export type UserMovie = SavedMovieUserEntry & {
  id: string;
  movie: SavedMovieDetails & { id: string };
};

export type UserMoviesPage = {
  movies: UserMovie[];
  nextPage: number | null;
};
