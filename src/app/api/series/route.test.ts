// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/series/route';

// The id validation is the same code as api/movie and is covered there. This
// file asserts only what differs: the service it calls and its two messages.
const getSeriesDetails = vi.fn<(id: string) => Promise<unknown>>(async () => ({
  id: 1399,
}));

vi.mock('@/services/getMedia', () => ({
  getSeriesDetails: (id: string) => getSeriesDetails(id),
}));

afterEach(() => {
  getSeriesDetails.mockClear();
});

const get = (query: string) =>
  GET(new Request(`https://midnightframe.app/api/series${query}`));

describe('GET /api/series', () => {
  it('looks the id up and returns the payload', async () => {
    const response = await get('?id=1399');

    expect(response.status).toBe(200);
    expect(getSeriesDetails).toHaveBeenCalledWith('1399');
    await expect(response.json()).resolves.toEqual({ id: 1399 });
  });

  it('404s when the service finds nothing', async () => {
    getSeriesDetails.mockResolvedValueOnce(null);
    const response = await get('?id=1399');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Series not found',
    });
  });

  it('500s when the service throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    getSeriesDetails.mockRejectedValueOnce(new Error('tmdb down'));

    const response = await get('?id=1399');

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to get series details',
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
