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

export type SavedMovieUserEntry = {
  status: 'watched' | 'to_watch';
  watched_date?: string;
  rating?: number;
  review?: string;
};

export type SavedMovieType = SavedMovieDetails & SavedMovieUserEntry;

export type UserMovie = SavedMovieUserEntry & {
  id: number;
  movie: SavedMovieDetails & { id: number };
};

export type UserMoviesPage = {
  movies: UserMovie[];
  nextPage: number | null;
};
