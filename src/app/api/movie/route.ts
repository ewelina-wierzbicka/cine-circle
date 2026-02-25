import { getMovieDetails } from '@/services/getMovies';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';

  try {
    const data = await getMovieDetails(id);

    return Response.json(data);
  } catch (error) {
    console.error('Get movie details error:', error);
    return Response.json(
      { error: 'Failed to get movie details' },
      { status: 500 },
    );
  }
}
