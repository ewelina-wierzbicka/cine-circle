import {
  FilterMediaType,
  Movie,
  NormalizedMedia,
  RecommendedMedia,
  Series,
  TmdbRecommendation,
} from '@/types';
import { cacheLife, cacheTag } from 'next/cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/** One request per detail page — never split these into extra fetches. */
const DETAIL_APPEND = 'credits,recommendations';

function getTmdbToken(): string {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error('Missing TMDB token');
  return token;
}

async function tmdbFetch<T>(
  path: string,
  nextConfig: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getTmdbToken()}` },
    next: nextConfig,
  });
  if (!res.ok) throw new Error('Failed to load data. Please try again.');
  return res.json() as Promise<T>;
}

async function tmdbFetchOrNull<T>(path: string): Promise<T | null> {
  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getTmdbToken()}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load data. Please try again.');
  return res.json() as Promise<T>;
}

function normalizeSeriesResult(
  raw: Series & {
    recommendations?: { results?: TmdbRecommendation[] };
  },
): NormalizedMedia {
  const {
    id,
    name,
    first_air_date,
    last_air_date,
    poster_path,
    popularity,
    created_by,
    overview,
    genres,
    episode_run_time,
    last_episode_to_air,
    vote_average,
    vote_count,
  } = raw;

  const recommendations: RecommendedMedia[] | undefined =
    raw.recommendations?.results?.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.name ?? r.title ?? '',
      poster_path: r.poster_path ?? undefined,
      media_type:
        r.media_type === 'movie' ? ('movie' as const) : ('series' as const),
      genre: r.genre_ids?.[0]
        ? genres?.find((g) => g.id === r.genre_ids![0])?.name
        : undefined,
    }));

  return {
    id,
    title: name,
    release_date: first_air_date,
    last_air_date,
    poster_path,
    popularity,
    director: created_by?.[0]?.name,
    media_type: 'series',
    overview,
    genres,
    recommendations,
    runtime: episode_run_time?.[0] ?? last_episode_to_air?.runtime ?? undefined,
    vote_average,
    vote_count,
  };
}

interface SearchMediaResponse {
  results: NormalizedMedia[];
  hasMore: boolean;
}

export const getMedia = async (
  query: string,
  page: number = 1,
  type: FilterMediaType = 'all',
): Promise<SearchMediaResponse> => {
  if (type === 'all') {
    const [movies, series] = await Promise.all([
      getMedia(query, page, 'movie'),
      getMedia(query, page, 'series'),
    ]);
    const combined = [...movies.results, ...series.results].toSorted(
      (a, b) => (b.popularity || 0) - (a.popularity || 0),
    );
    return { results: combined, hasMore: movies.hasMore || series.hasMore };
  }

  if (type === 'series') {
    const data = await tmdbFetch<{
      results: Series[];
      total_pages: number;
    }>(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`, {
      revalidate: 3600,
    });
    const sortedResults = data?.results
      ?.map(normalizeSeriesResult)
      .toSorted((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return {
      results: sortedResults || [],
      hasMore: page < (data?.total_pages || 0),
    };
  }

  const data = await tmdbFetch<{
    results: Movie[];
    total_pages: number;
  }>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`, {
    revalidate: 3600,
  });

  const sortedResults = data?.results
    ?.map((movie) => ({ ...movie, media_type: 'movie' as const }))
    .toSorted((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return {
    results: sortedResults || [],
    hasMore: page < (data?.total_pages || 0),
  };
};

export const getMovieDetails = async (
  id: string,
): Promise<NormalizedMedia | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(`movie-${id}`);

  const data = await tmdbFetchOrNull<
    NormalizedMedia & {
      credits?: { crew?: { job: string; name: string }[] };
      recommendations?: { results?: TmdbRecommendation[] };
    }
  >(`/movie/${id}?append_to_response=${DETAIL_APPEND}`);
  if (data === null) return null;

  const { credits, recommendations: rawRecommendations, ...movie } = data;

  const director = credits?.crew?.find(
    (person) => person.job === 'Director',
  )?.name;

  const recommendations: RecommendedMedia[] | undefined =
    rawRecommendations?.results?.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.title ?? r.name ?? '',
      poster_path: r.poster_path ?? undefined,
      media_type:
        r.media_type === 'tv' ? ('series' as const) : ('movie' as const),
      genre: r.genre_ids?.[0]
        ? movie.genres?.find((g) => g.id === r.genre_ids![0])?.name
        : undefined,
    }));

  return {
    ...movie,
    director,
    recommendations,
  };
};

export const getSeriesDetails = async (
  id: string,
): Promise<NormalizedMedia | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(`series-${id}`);

  const data = await tmdbFetchOrNull<
    Series & { recommendations?: { results?: TmdbRecommendation[] } }
  >(`/tv/${id}?append_to_response=${DETAIL_APPEND}`);
  return data === null ? null : normalizeSeriesResult(data);
};
