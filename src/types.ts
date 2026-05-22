export type RegistrationData = {
  email: string;
  password: string;
  confirmPassword?: string;
};

export type MediaType = 'movie' | 'series';

export type FilterMediaType = 'movie' | 'series' | 'all';

export type Movie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  popularity?: number;
  director?: string;
};

export type Series = {
  id: number;
  name: string;
  first_air_date?: string;
  last_air_date?: string;
  poster_path?: string;
  popularity?: number;
  created_by?: { name: string }[];
};

export type NormalizedMedia = Movie & {
  media_type: MediaType;
  last_air_date?: string;
};

export type UserEntry = {
  watchStatus: 'watched' | 'to_watch';
  watched_date?: string;
  rating?: number;
  review?: string;
};

type SavedMediaDetails = Omit<NormalizedMedia, 'popularity'> & {
  tmdb_id: number;
};

export type UserMedia = UserEntry & {
  id: number;
  media: SavedMediaDetails;
};

export type SavedMedia = UserEntry & {
  id: number;
} & SavedMediaDetails;

export type UserMediaPage = {
  media: UserMedia[];
  nextPage: number | null;
};

export type UserProfile = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type TrendingMovie = {
  title: string;
  year: string;
  genre: string;
  posterUrl?: string;
};
