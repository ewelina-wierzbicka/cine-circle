import { getMovieDetails } from '@/services/getMovies';
import { notFound } from 'next/navigation';
import MovieDetail from './MovieDetail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id: slug } = await params;
  const id = slug.split('-')[0];

  if (!id) notFound();

  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch {
    notFound();
  }

  return <MovieDetail movie={movie} />;
}
