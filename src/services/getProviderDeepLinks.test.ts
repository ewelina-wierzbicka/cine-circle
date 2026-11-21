import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProviderDeepLinks } from '@/services/getProviderDeepLinks';

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const netflixClaims = {
  P1874: [
    {
      rank: 'normal',
      mainsnak: { snaktype: 'value', datavalue: { value: '80000001' } },
    },
  ],
};

describe('getProviderDeepLinks', () => {
  it.each([null, undefined, 'not-a-qid', 'Q', 'q123', 'Q12x'])(
    'returns {} with no fetch for %j',
    async (id) => {
      expect(await getProviderDeepLinks(id, 'movie')).toEqual({});
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('builds links from the claims of the requested entity', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ entities: { Q123: { claims: netflixClaims } } }),
    );

    expect(await getProviderDeepLinks('Q123', 'movie')).toEqual({
      netflix: 'https://www.netflix.com/title/80000001',
    });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://www.wikidata.org/wiki/Special:EntityData/Q123.json',
    );
  });

  it('returns {} on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({}, { status: 503 }));
    expect(await getProviderDeepLinks('Q123', 'movie')).toEqual({});
  });

  it.each([
    ['an abort', new DOMException('timed out', 'TimeoutError')],
    ['a thrown error', new TypeError('fetch failed')],
  ])('returns {} on %s', async (_, error) => {
    fetchMock.mockRejectedValueOnce(error);
    expect(await getProviderDeepLinks('Q123', 'movie')).toEqual({});
  });

  it('sends a real User-Agent', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ entities: {} }));
    await getProviderDeepLinks('Q123', 'movie');

    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('User-Agent')).toMatch(/^MidnightFrame\/\S+ \(.+\)$/);
  });
});
