export type Movie = {
  id: number;
  title: string;
  popularity: number;
  release_date: string;
  poster_path: string;
  director?: string;
};

export type MovieWatchedType = {
  id: string;
  watched_date?: string;
  rating?: number;
  review?: string;
};
