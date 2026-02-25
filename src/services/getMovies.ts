import { Movie } from '@/types';

interface SearchMoviesResponse {
  results: Movie[];
  hasMore: boolean;
}

export const getMovies = async (
  query: string,
  page: number = 1,
): Promise<SearchMoviesResponse> => {
  const baseUrl = 'https://api.themoviedb.org/3';
  const token = process.env.TMDB_TOKEN;

  if (!token) throw new Error('Missing TMDB token');

  const res = await fetch(
    `${baseUrl}/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status}`);
  }

  const data = await res.json();

  const sortedResults = data?.results?.sort(
    (a: Movie, b: Movie) => b.popularity - a.popularity,
  );

  return {
    results: sortedResults || [],
    hasMore: page < (data?.total_pages || 0),
  };
};

export const getMovieDetails = async (id: string): Promise<Movie> => {
  const baseUrl = 'https://api.themoviedb.org/3';
  const token = process.env.TMDB_TOKEN;

  if (!token) throw new Error('Missing TMDB token');

  const res = await fetch(`${baseUrl}/movie/${id}?append_to_response=credits`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status}`);
  }

  const data = await res.json();

  const director = data.credits?.crew?.find(
    (person: { job: string }) => person.job === 'Director',
  )?.name;

  return {
    ...data,
    director,
  };
};
