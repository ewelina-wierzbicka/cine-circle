import {
  FilterMediaType,
  Movie,
  NormalizedMedia,
  RecommendedMedia,
  Series,
} from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
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
  } = raw;

  const recommendations: RecommendedMedia[] | undefined =
    raw.recommendations?.results?.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.name ?? r.title ?? '',
      poster_path: r.poster_path ?? undefined,
      media_type: 'series' as const,
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
  };
}

type TmdbRecommendation = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  genre_ids?: number[];
};

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

export const getMovieDetails = async (id: string): Promise<NormalizedMedia> => {
  const data = await tmdbFetch<
    NormalizedMedia & {
      credits?: { crew?: { job: string; name: string }[] };
      recommendations?: { results?: TmdbRecommendation[] };
    }
  >(`/movie/${id}?append_to_response=credits,recommendations`, {
    revalidate: 86400,
  });

  const director = data.credits?.crew?.find(
    (person) => person.job === 'Director',
  )?.name;

  const recommendations: RecommendedMedia[] | undefined =
    data.recommendations?.results?.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.title ?? r.name ?? '',
      poster_path: r.poster_path ?? undefined,
      media_type: 'movie' as const,
      genre: r.genre_ids?.[0]
        ? data.genres?.find((g) => g.id === r.genre_ids![0])?.name
        : undefined,
    }));

  return {
    ...data,
    director,
    overview: data.overview,
    genres: data.genres,
    recommendations,
  };
};

export const getSeriesDetails = async (
  id: string,
): Promise<NormalizedMedia> => {
  const data = await tmdbFetch<
    Series & { recommendations?: { results?: TmdbRecommendation[] } }
  >(`/tv/${id}?append_to_response=credits,recommendations`, {
    revalidate: 86400,
  });

  return normalizeSeriesResult(data);
};
