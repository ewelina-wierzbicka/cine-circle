export type Movie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  popularity?: number;
  director?: string;
};

export type UserEntry = {
  status: 'watched' | 'to_watch';
  watched_date?: string;
  rating?: number;
  review?: string;
};

export type SavedMovie = Movie & UserEntry & { userMovieId: number };

export type UserMovie = UserEntry & {
  id: number;
  movie: {
    id: number;
    tmdb_id: number;
    title: string;
    release_date?: string;
    poster_path?: string;
    director?: string;
  };
};

export type UserMoviesPage = {
  movies: UserMovie[];
  nextPage: number | null;
};
