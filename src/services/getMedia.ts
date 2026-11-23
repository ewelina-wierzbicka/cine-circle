import {
  FilterMediaType,
  MediaExternalIds,
  MediaType,
  Movie,
  NormalizedMedia,
  RecommendedMedia,
  RegionWatchProviders,
  Series,
  TmdbRecommendation,
  WatchProvider,
} from '@/types';
import { cacheLife, cacheTag } from 'next/cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/** One request per detail page — never split these into extra fetches. */
const DETAIL_APPEND = 'credits,recommendations,watch/providers,external_ids';

type TmdbWatchProviders = {
  results?: Record<string, RegionWatchProviders | undefined>;
};

/** Only the Wikidata and IMDb ids are read; the rest of the block is ignored. */
type TmdbExternalIds = {
  wikidata_id?: string | null;
  imdb_id?: string | null;
};

type MovieDetailResponse = NormalizedMedia & {
  credits?: { crew?: { job: string; name: string }[] };
  recommendations?: { results?: TmdbRecommendation[] };
  'watch/providers'?: TmdbWatchProviders;
  external_ids?: TmdbExternalIds;
};

type SeriesDetailResponse = Series & {
  recommendations?: { results?: TmdbRecommendation[] };
  'watch/providers'?: TmdbWatchProviders;
  external_ids?: TmdbExternalIds;
};

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

function normalizeSeriesResult(raw: SeriesDetailResponse): NormalizedMedia {
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
    number_of_seasons,
    number_of_episodes,
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
    number_of_seasons,
    number_of_episodes,
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

const getMovieDetailResponse = async (
  id: string,
): Promise<MovieDetailResponse | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(`movie-${id}`);

  return tmdbFetchOrNull<MovieDetailResponse>(
    `/movie/${id}?append_to_response=${DETAIL_APPEND}`,
  );
};

const getSeriesDetailResponse = async (
  id: string,
): Promise<SeriesDetailResponse | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(`series-${id}`);

  return tmdbFetchOrNull<SeriesDetailResponse>(
    `/tv/${id}?append_to_response=${DETAIL_APPEND}`,
  );
};

export const getMovieDetails = async (
  id: string,
): Promise<NormalizedMedia | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(`movie-${id}`);

  const data = await getMovieDetailResponse(id);
  if (data === null) return null;

  const {
    credits,
    recommendations: rawRecommendations,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to keep the country map out of the returned object
    'watch/providers': watchProviders,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to keep the external id block out of the returned object
    external_ids: externalIds,
    ...movie
  } = data;

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

  const data = await getSeriesDetailResponse(id);
  return data === null ? null : normalizeSeriesResult(data);
};

const matching = (
  value: string | null | undefined,
  pattern: RegExp,
): string | null => (value && pattern.test(value) ? value : null);

export const getExternalIds = async (
  id: string,
  mediaType: MediaType,
): Promise<MediaExternalIds> => {
  const data =
    mediaType === 'series'
      ? await getSeriesDetailResponse(id)
      : await getMovieDetailResponse(id);

  return {
    wikidataId: matching(data?.external_ids?.wikidata_id, /^Q\d+$/),
    imdbId: matching(data?.external_ids?.imdb_id, /^tt\d+$/),
  };
};

const pickProviders = (
  providers: WatchProvider[] | undefined,
): WatchProvider[] | undefined =>
  providers?.map(({ provider_id, provider_name, logo_path }) => ({
    provider_id,
    provider_name,
    logo_path,
  }));

export const getWatchProviders = async (
  id: string,
  mediaType: MediaType,
  region: string,
): Promise<RegionWatchProviders | null> => {
  const data =
    mediaType === 'series'
      ? await getSeriesDetailResponse(id)
      : await getMovieDetailResponse(id);

  const regionProviders = data?.['watch/providers']?.results?.[region];
  if (!regionProviders) return null;

  return {
    link: regionProviders.link,
    flatrate: pickProviders(regionProviders.flatrate),
    rent: pickProviders(regionProviders.rent),
    buy: pickProviders(regionProviders.buy),
    ads: pickProviders(regionProviders.ads),
    free: pickProviders(regionProviders.free),
  };
};
