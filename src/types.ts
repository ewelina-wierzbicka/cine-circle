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
  overview?: string;
  genres?: { id: number; name: string }[];
};

export type TmdbRecommendation = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
};

export type RecommendedMedia = {
  id: number;
  title: string;
  poster_path?: string;
  media_type: MediaType;
  genre?: string;
};

export type NormalizedMedia = Movie & {
  media_type: MediaType;
  last_air_date?: string;
  overview?: string;
  genres?: { id: number; name: string }[];
  recommendations?: RecommendedMedia[];
};

export type UserEntry = {
  watchStatus: 'watched' | 'to_watch';
  watched_date?: string;
  rating?: number | null;
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
  type: MediaType;
  genres?: { id: number; name: string }[];
  posterUrl?: string;
  id: number;
};
