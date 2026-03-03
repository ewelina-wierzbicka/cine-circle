import { apiError } from '@/lib/apiError';
import { getMovieDetails } from '@/services/getMovies';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id')?.trim();

  if (!id) return apiError('Missing id parameter', 400);
  if (!/^\d+$/.test(id)) return apiError('Invalid id parameter', 400);

  try {
    const data = await getMovieDetails(id);
    return Response.json(data);
  } catch (error) {
    console.error('Get movie details error:', error);
    return apiError('Failed to get movie details', 500);
  }
}
