// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPopularMediaEntries,
  getStaticMediaParams,
} from '@/services/getStaticMediaParams';

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

const TMDB = {
  trending: {
    results: [
      {
        id: 550,
        title: 'Fight Club',
        media_type: 'movie',
        poster_path: '/a.jpg',
      },
      {
        id: 1399,
        name: 'Game of Thrones',
        media_type: 'tv',
        poster_path: '/b.jpg',
      },
    ],
  },
  movies: [
    // 550 repeats the trending movie; 1399 as a movie is a different entry.
    { id: 550, title: 'Fight Club' },
    { id: 1399, title: 'Same id, other type' },
    { id: 13, title: 'Forrest Gump' },
  ],
  series: [{ id: 1399, name: 'Game of Thrones' }],
};

function serveTmdb() {
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes('/trending/')) return Response.json(TMDB.trending);
    if (url.includes('/movie/popular'))
      return Response.json({ results: TMDB.movies });
    if (url.includes('/tv/popular'))
      return Response.json({ results: TMDB.series });
    return Response.json({}, { status: 404 });
  });
}

beforeEach(() => {
  vi.stubEnv('TMDB_TOKEN', 'test-token');
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getPopularMediaEntries', () => {
  it('dedupes by media type and id', async () => {
    serveTmdb();
    const keys = (await getPopularMediaEntries()).map(
      (e) => `${e.mediaType}-${e.id}`,
    );

    expect(keys).toEqual([
      'movie-550',
      'series-1399',
      'movie-1399',
      'movie-13',
    ]);
  });
});

describe('getStaticMediaParams', () => {
  it('returns the canonical slug as the [id] param', async () => {
    serveTmdb();

    expect(await getStaticMediaParams('movie')).toEqual([
      { id: '550-fight-club' },
      { id: '1399-same-id-other-type' },
      { id: '13-forrest-gump' },
    ]);
    expect(await getStaticMediaParams('series')).toEqual([
      { id: '1399-game-of-thrones' },
    ]);
  });

  it('returns [] when TMDB fails, so the build survives an outage', async () => {
    fetchMock.mockResolvedValue(Response.json({}, { status: 500 }));
    expect(await getStaticMediaParams('movie')).toEqual([]);
  });

  it('returns [] on a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    expect(await getStaticMediaParams('series')).toEqual([]);
  });
});
