// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/series/route';

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
  it.each([
    ['no id param', '', 'Missing id parameter'],
    ['an empty id', '?id=', 'Missing id parameter'],
    ['a whitespace id', '?id=%20%20', 'Missing id parameter'],
    ['a non-numeric id', '?id=1399-got', 'Invalid id parameter'],
    ['a negative id', '?id=-1399', 'Invalid id parameter'],
  ])('400s on %s', async (_, query, error) => {
    const response = await get(query);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error });
    expect(getSeriesDetails).not.toHaveBeenCalled();
  });

  it('trims the id before the lookup', async () => {
    const response = await get('?id=%201399%20');

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
