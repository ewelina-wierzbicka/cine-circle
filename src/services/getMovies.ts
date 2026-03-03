import { Movie } from '@/types';

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

interface SearchMoviesResponse {
  results: Movie[];
  hasMore: boolean;
}

export const getMovies = async (
  query: string,
  page: number = 1,
): Promise<SearchMoviesResponse> => {
  const data = await tmdbFetch<{ results: Movie[]; total_pages: number }>(
    `/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
    { revalidate: 3600 },
  );

  const sortedResults = data?.results?.toSorted(
    (a, b) => (b.popularity || 0) - (a.popularity || 0),
  );

  return {
    results: sortedResults || [],
    hasMore: page < (data?.total_pages || 0),
  };
};

export const getMovieDetails = async (id: string): Promise<Movie> => {
  const data = await tmdbFetch<
    Movie & { credits?: { crew?: { job: string; name: string }[] } }
  >(`/movie/${id}?append_to_response=credits`, {
    revalidate: 86400,
    // tags: [`movie-${id}`],
  });

  const director = data.credits?.crew?.find(
    (person) => person.job === 'Director',
  )?.name;

  return {
    ...data,
    director,
  };
};
