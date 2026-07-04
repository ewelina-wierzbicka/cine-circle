import { TrendingMovie } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function getTmdbToken(): string {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error('Missing TMDB_TOKEN env variable');
  return token;
}

type GenreMap = Record<number, string>;

type TmdbGenreListResponse = {
  genres: { id: number; name: string }[];
};

type TmdbTrendingItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'person';
};

type TmdbTrendingResponse = {
  results: TmdbTrendingItem[];
};

async function fetchGenreMap(): Promise<GenreMap> {
  const headers = { Authorization: `Bearer ${getTmdbToken()}` };

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/genre/movie/list?language=en-US`, {
      headers,
      next: { revalidate: 604800, tags: ['tmdb-genres'] },
    }),
    fetch(`${TMDB_BASE_URL}/genre/tv/list?language=en-US`, {
      headers,
      next: { revalidate: 604800, tags: ['tmdb-genres'] },
    }),
  ]);

  const [movieData, tvData] = (await Promise.all([
    movieRes.json(),
    tvRes.json(),
  ])) as [TmdbGenreListResponse, TmdbGenreListResponse];

  const map: GenreMap = {};
  for (const g of [...(movieData.genres ?? []), ...(tvData.genres ?? [])]) {
    map[g.id] = g.name;
  }
  return map;
}

export async function getTrendingMovies(): Promise<TrendingMovie[]> {
  const headers = { Authorization: `Bearer ${getTmdbToken()}` };

  const [trendingRes, genreMap] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/trending/all/week?language=en-US`, {
      headers,
      next: { revalidate: 86400, tags: ['trending-movies'] },
    }),
    fetchGenreMap(),
  ]);

  if (!trendingRes.ok) {
    throw new Error(`TMDB trending request failed: ${trendingRes.status}`);
  }

  const data = (await trendingRes.json()) as TmdbTrendingResponse;

  return data.results
    .filter(
      (item): item is TmdbTrendingItem & { poster_path: string } =>
        item.media_type !== 'person' && typeof item.poster_path === 'string',
    )
    .slice(0, 6)
    .map((item) => ({
      title: item.title ?? item.name ?? 'Unknown',
      year: (item.release_date ?? item.first_air_date ?? '').slice(0, 4),
      genre:
        item.genre_ids?.[0] != null ? (genreMap[item.genre_ids[0]] ?? '') : '',
      type: item.media_type === 'movie' ? 'movie' : 'series',
      posterUrl: `${TMDB_IMAGE_BASE}${item.poster_path}`,
      id: item.id,
    }));
}
