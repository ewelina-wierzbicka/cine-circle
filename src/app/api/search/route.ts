import getMovies from '@/services/getMovies';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const data = await getMovies(query, page);

    return Response.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Failed to search movies' }, { status: 500 });
  }
}
