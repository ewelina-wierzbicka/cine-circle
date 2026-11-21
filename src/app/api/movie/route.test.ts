// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/movie/route';

const getMovieDetails = vi.fn<(id: string) => Promise<unknown>>(async () => ({
  id: 550,
}));

vi.mock('@/services/getMedia', () => ({
  getMovieDetails: (id: string) => getMovieDetails(id),
}));

afterEach(() => {
  getMovieDetails.mockClear();
});

const get = (query: string) =>
  GET(new Request(`https://midnightframe.app/api/movie${query}`));

describe('GET /api/movie', () => {
  it.each([
    ['no id param', '', 'Missing id parameter'],
    ['an empty id', '?id=', 'Missing id parameter'],
    ['a whitespace id', '?id=%20%20', 'Missing id parameter'],
    ['a non-numeric id', '?id=550-fight-club', 'Invalid id parameter'],
    ['a negative id', '?id=-550', 'Invalid id parameter'],
  ])('400s on %s', async (_, query, error) => {
    const response = await get(query);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error });
    expect(getMovieDetails).not.toHaveBeenCalled();
  });

  it('trims the id before the lookup', async () => {
    const response = await get('?id=%20550%20');

    expect(response.status).toBe(200);
    expect(getMovieDetails).toHaveBeenCalledWith('550');
    await expect(response.json()).resolves.toEqual({ id: 550 });
  });

  it('404s when the service finds nothing', async () => {
    getMovieDetails.mockResolvedValueOnce(null);
    const response = await get('?id=550');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Movie not found',
    });
  });

  it('500s when the service throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    getMovieDetails.mockRejectedValueOnce(new Error('tmdb down'));

    const response = await get('?id=550');

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to get movie details',
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
