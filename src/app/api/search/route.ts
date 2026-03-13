import { apiError } from '@/lib/apiError';
import { getMedia } from '@/services/getMedia';
import { FilterMediaType } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim() ?? '';
  const rawPage = searchParams.get('page');
  const page = rawPage ? parseInt(rawPage, 10) : 1;
  const rawType = searchParams.get('type') ?? 'all';
  const type: FilterMediaType = ['movie', 'series', 'all'].includes(rawType)
    ? (rawType as FilterMediaType)
    : 'all';

  if (!query) return apiError('Missing query parameter', 400);
  if (!Number.isInteger(page) || page < 1)
    return apiError('Invalid page parameter', 400);

  try {
    const data = await getMedia(query, page, type);
    return Response.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return apiError('Failed to search', 500);
  }
}
