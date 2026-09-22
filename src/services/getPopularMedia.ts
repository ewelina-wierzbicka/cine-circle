import { cacheLife, cacheTag } from 'next/cache';
import { PopularMedia } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function getTmdbToken(): string {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error('Missing TMDB_TOKEN env variable');
  return token;
}

type TmdbPopularItem = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
};

type TmdbPopularResponse = {
  results?: TmdbPopularItem[];
};

async function fetchPopular(path: string): Promise<TmdbPopularItem[]> {
  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getTmdbToken()}` },
  });
  if (!res.ok) throw new Error(`TMDB popular request failed: ${res.status}`);
  const data = (await res.json()) as TmdbPopularResponse;
  return data.results ?? [];
}

// A title is only usable in the sitemap if it can produce the same slug the
// page canonicalises to, so entries without one are dropped.
function toPopularMedia(
  items: TmdbPopularItem[],
  mediaType: PopularMedia['mediaType'],
): PopularMedia[] {
  return items.flatMap((item) => {
    const title = item.title ?? item.name;
    if (!title) return [];
    return [
      {
        id: item.id,
        title,
        mediaType,
        releaseDate: item.release_date ?? item.first_air_date,
      },
    ];
  });
}

export async function getPopularMovies(page: number): Promise<PopularMedia[]> {
  'use cache';
  cacheLife('days');
  cacheTag(`popular-movies-${page}`);

  const results = await fetchPopular(
    `/movie/popular?language=en-US&page=${page}`,
  );
  return toPopularMedia(results, 'movie');
}

export async function getPopularSeries(page: number): Promise<PopularMedia[]> {
  'use cache';
  cacheLife('days');
  cacheTag(`popular-series-${page}`);

  const results = await fetchPopular(`/tv/popular?language=en-US&page=${page}`);
  return toPopularMedia(results, 'series');
}
