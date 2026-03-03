import { getUserMovie } from '@/services/getUserMovies';
import { notFound } from 'next/navigation';
import WatchedMovieDetail from './WatchedMovieDetail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id: slug } = await params;
  const id = slug.split('-')[0];
  const tmdbId = Number(id);

  if (!tmdbId) notFound();

  let userMovie;
  try {
    userMovie = await getUserMovie(tmdbId);
  } catch {
    notFound();
  }

  return <WatchedMovieDetail userMovie={userMovie} />;
}
