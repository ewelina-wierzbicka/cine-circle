import ErrorToast from '@/components/ErrorToast';
import { getMovieDetails } from '@/services/getMovies';
import { getUserMovie } from '@/services/getUserMovies';
import { SavedMovie } from '@/types';
import { notFound } from 'next/navigation';
import MovieDetail from './MovieDetail';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id: slug } = await params;
  const { step } = await searchParams;
  const id = slug.split('-')[0];
  const tmdbId = Number(id);

  if (!tmdbId) notFound();

  let error: string | null = null;
  let userMovie = null;
  try {
    userMovie = await getUserMovie(tmdbId);
  } catch (err) {
    if ((err as { code?: string }).code !== 'PGRST116') {
      error = (err as Error).message || 'Failed to load saved movie data.';
    }
  }

  let data;
  if (userMovie) {
    const { id, status, watched_date, rating, review, movie } = userMovie;
    const { tmdb_id, title, release_date, poster_path, director } = movie;
    data = {
      id: tmdb_id,
      title,
      release_date,
      poster_path,
      director,
      userMovieId: id,
      status,
      watched_date,
      rating,
      review,
    } satisfies SavedMovie;
  } else if (!error) {
    try {
      data = await getMovieDetails(id);
    } catch (err) {
      error = (err as Error).message || 'Failed to load movie data.';
    }
  }

  const initialStep = step === '2' ? 2 : 1;

  return (
    <>
      {error && <ErrorToast message={error} />}
      {data && <MovieDetail movie={data} initialStep={initialStep} />}
    </>
  );
}
