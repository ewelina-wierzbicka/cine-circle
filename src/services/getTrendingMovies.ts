import { cacheLife, cacheTag } from 'next/cache';
import { TrendingMovie } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function getTmdbToken(): string {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error('Missing TMDB_TOKEN env variable');
  return token;
}

type TmdbTrendingItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'person';
};

type TmdbTrendingResponse = {
  results: TmdbTrendingItem[];
};

export async function getTrendingMovies(): Promise<TrendingMovie[]> {
  'use cache';
  cacheLife('days');
  cacheTag('trending');

  const headers = { Authorization: `Bearer ${getTmdbToken()}` };

  const trendingRes = await fetch(
    `${TMDB_BASE_URL}/trending/all/week?language=en-US`,
    { headers },
  );

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
      type: item.media_type === 'movie' ? 'movie' : 'series',
      posterUrl: `${TMDB_IMAGE_BASE}${item.poster_path}`,
      id: item.id,
    }));
}
