// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/search/route';

const getMedia = vi.fn<
  (query: string, page: number, type: string) => Promise<unknown>
>(async () => ({ results: [], hasMore: false }));

vi.mock('@/services/getMedia', () => ({
  getMedia: (query: string, page: number, type: string) =>
    getMedia(query, page, type),
}));

afterEach(() => {
  getMedia.mockClear();
});

const get = (query: string) =>
  GET(new Request(`https://midnightframe.app/api/search${query}`));

describe('GET /api/search', () => {
  it.each([
    ['no query param', ''],
    ['an empty query', '?query='],
    ['a whitespace query', '?query=%20%20'],
  ])('400s on %s', async (_, query) => {
    const response = await get(query);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Missing query parameter',
    });
    expect(getMedia).not.toHaveBeenCalled();
  });

  it.each(['0', '-1', 'abc'])('400s on page=%s', async (page) => {
    const response = await get(`?query=fight&page=${page}`);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid page parameter',
    });
    expect(getMedia).not.toHaveBeenCalled();
  });

  // parseInt, not Number: a trailing fraction is truncated rather than rejected.
  it.each(['1.5', '2abc'])('truncates page=%s', async (page) => {
    const response = await get(`?query=fight&page=${page}`);

    expect(response.status).toBe(200);
    expect(getMedia).toHaveBeenCalledWith('fight', parseInt(page, 10), 'all');
  });

  it('defaults to page 1 and type all', async () => {
    const response = await get('?query=%20fight%20');

    expect(response.status).toBe(200);
    expect(getMedia).toHaveBeenCalledWith('fight', 1, 'all');
  });

  it.each(['movie', 'series', 'all'])(
    'passes type=%s through',
    async (type) => {
      await get(`?query=fight&type=${type}`);
      expect(getMedia).toHaveBeenCalledWith('fight', 1, type);
    },
  );

  it('falls back to type all on an unknown type', async () => {
    await get('?query=fight&type=book');
    expect(getMedia).toHaveBeenCalledWith('fight', 1, 'all');
  });

  it('returns the service payload', async () => {
    const payload = { results: [{ id: 550 }], hasMore: true };
    getMedia.mockResolvedValueOnce(payload as never);

    const response = await get('?query=fight&page=2');

    expect(getMedia).toHaveBeenCalledWith('fight', 2, 'all');
    await expect(response.json()).resolves.toEqual(payload);
  });

  it('500s when the service throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    getMedia.mockRejectedValueOnce(new Error('tmdb down'));

    const response = await get('?query=fight');

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to search',
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
