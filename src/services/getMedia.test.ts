// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMedia,
  getMovieDetails,
  getSeriesDetails,
  getWatchProviders,
  getWikidataId,
} from '@/services/getMedia';

// The services carry 'use cache', which is inert outside Next. Only the
// cacheLife and cacheTag calls need stubbing.
vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('TMDB_TOKEN', 'test-token');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// Answers each request by the first route whose path fragment the URL contains.
function route(routes: Record<string, unknown>) {
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    const match = Object.keys(routes).find((path) => url.includes(path));
    if (!match) return Response.json({}, { status: 404 });
    return Response.json(routes[match]);
  });
}

function requestedUrls(): string[] {
  return fetchMock.mock.calls.map(([input]) => String(input));
}

const seriesPayload = {
  id: 1399,
  name: 'Game of Thrones',
  first_air_date: '2011-04-17',
  last_air_date: '2019-05-19',
  created_by: [{ name: 'David Benioff' }, { name: 'D. B. Weiss' }],
  genres: [
    { id: 18, name: 'Drama' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
  ],
  episode_run_time: [60],
  number_of_seasons: 8,
  number_of_episodes: 73,
  // Specials plus 8 seasons: a seasons.length count would say 9.
  seasons: Array.from({ length: 9 }, (_, i) => ({ season_number: i })),
};

describe('getSeriesDetails', () => {
  it('maps the series fields onto NormalizedMedia', async () => {
    route({ '/tv/1399': seriesPayload });

    expect(await getSeriesDetails('1399')).toMatchObject({
      id: 1399,
      title: 'Game of Thrones',
      release_date: '2011-04-17',
      last_air_date: '2019-05-19',
      director: 'David Benioff',
      media_type: 'series',
    });
  });

  it('takes runtime from episode_run_time[0]', async () => {
    route({
      '/tv/1': {
        ...seriesPayload,
        episode_run_time: [55, 70],
        last_episode_to_air: { runtime: 80 },
      },
    });
    expect((await getSeriesDetails('1'))?.runtime).toBe(55);
  });

  it('falls back to last_episode_to_air.runtime', async () => {
    route({
      '/tv/1': {
        ...seriesPayload,
        episode_run_time: [],
        last_episode_to_air: { runtime: 42 },
      },
    });
    expect((await getSeriesDetails('1'))?.runtime).toBe(42);
  });

  it('leaves runtime undefined with neither source', async () => {
    route({
      '/tv/1': {
        ...seriesPayload,
        episode_run_time: [],
        last_episode_to_air: { runtime: null },
      },
    });
    expect((await getSeriesDetails('1'))?.runtime).toBeUndefined();
  });

  it('takes the season and episode counts from the TMDB scalars', async () => {
    route({ '/tv/1399': seriesPayload });
    expect(await getSeriesDetails('1399')).toMatchObject({
      number_of_seasons: 8,
      number_of_episodes: 73,
    });
  });

  it('returns null for an unknown id', async () => {
    route({});
    expect(await getSeriesDetails('1')).toBeNull();
  });
});

const recommendations = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `R${i + 1}` }));

describe('recommendations', () => {
  it('caps a series at 10', async () => {
    route({
      '/tv/1': {
        ...seriesPayload,
        recommendations: { results: recommendations(15) },
      },
    });
    expect((await getSeriesDetails('1'))?.recommendations).toHaveLength(10);
  });

  it('caps a movie at 10', async () => {
    route({
      '/movie/1': {
        id: 1,
        title: 'M',
        recommendations: { results: recommendations(15) },
      },
    });
    expect((await getMovieDetails('1'))?.recommendations).toHaveLength(10);
  });

  it('types series recommendations: movie stays movie, anything else is series', async () => {
    route({
      '/tv/1': {
        ...seriesPayload,
        recommendations: {
          results: [
            { id: 1, name: 'A', media_type: 'movie' },
            { id: 2, name: 'B', media_type: 'tv' },
            { id: 3, name: 'C' },
          ],
        },
      },
    });
    const types = (await getSeriesDetails('1'))?.recommendations?.map(
      (r) => r.media_type,
    );
    expect(types).toEqual(['movie', 'series', 'series']);
  });

  it('types movie recommendations: tv becomes series, anything else is movie', async () => {
    route({
      '/movie/1': {
        id: 1,
        title: 'M',
        recommendations: {
          results: [
            { id: 1, title: 'A', media_type: 'tv' },
            { id: 2, title: 'B', media_type: 'movie' },
            { id: 3, title: 'C' },
          ],
        },
      },
    });
    const types = (await getMovieDetails('1'))?.recommendations?.map(
      (r) => r.media_type,
    );
    expect(types).toEqual(['series', 'movie', 'movie']);
  });

  it('resolves the genre from the parent genres by the first genre_id', async () => {
    route({
      '/tv/1': {
        ...seriesPayload,
        recommendations: {
          results: [
            { id: 1, name: 'A', genre_ids: [10765, 18] },
            { id: 2, name: 'B', genre_ids: [99] },
            { id: 3, name: 'C' },
          ],
        },
      },
    });
    const genres = (await getSeriesDetails('1'))?.recommendations?.map(
      (r) => r.genre,
    );
    expect(genres).toEqual(['Sci-Fi & Fantasy', undefined, undefined]);
  });
});

describe('getMovieDetails', () => {
  const moviePayload = {
    id: 550,
    title: 'Fight Club',
    credits: {
      crew: [
        { job: 'Producer', name: 'Art Linson' },
        { job: 'Director', name: 'David Fincher' },
      ],
    },
    'watch/providers': { results: { US: { link: 'https://tmdb' } } },
    external_ids: { wikidata_id: 'Q190050' },
  };

  it('takes the director from the crew member whose job is Director', async () => {
    route({ '/movie/550': moviePayload });
    expect((await getMovieDetails('550'))?.director).toBe('David Fincher');
  });

  it('strips watch/providers and external_ids from the result', async () => {
    route({ '/movie/550': moviePayload });
    const movie = await getMovieDetails('550');

    expect(movie).not.toHaveProperty('watch/providers');
    expect(movie).not.toHaveProperty('external_ids');
    expect(movie).not.toHaveProperty('credits');
  });
});

describe('getMedia', () => {
  it("merges movies and series by popularity for 'all'", async () => {
    route({
      '/search/movie': {
        results: [
          { id: 1, title: 'Movie low', popularity: 10 },
          { id: 2, title: 'Movie high', popularity: 90 },
        ],
        total_pages: 1,
      },
      '/search/tv': {
        results: [{ id: 3, name: 'Series mid', popularity: 50 }],
        total_pages: 1,
      },
    });

    const { results } = await getMedia('x', 1, 'all');
    expect(results.map((r) => [r.title, r.media_type])).toEqual([
      ['Movie high', 'movie'],
      ['Series mid', 'series'],
      ['Movie low', 'movie'],
    ]);
  });

  it.each([
    [3, 1, true],
    [1, 3, true],
    [1, 1, false],
  ])(
    "hasMore for 'all' is true when either side has more (movie pages %i, series pages %i)",
    async (moviePages, seriesPages, expected) => {
      route({
        '/search/movie': { results: [], total_pages: moviePages },
        '/search/tv': { results: [], total_pages: seriesPages },
      });
      expect((await getMedia('x', 1, 'all')).hasMore).toBe(expected);
    },
  );

  it('reports no more results on the last page', async () => {
    route({ '/search/movie': { results: [], total_pages: 3 } });
    expect((await getMedia('x', 3, 'movie')).hasMore).toBe(false);
    expect((await getMedia('x', 2, 'movie')).hasMore).toBe(true);
  });

  it('URL-encodes the query', async () => {
    route({ '/search/movie': { results: [], total_pages: 0 } });
    await getMedia('Tom & Jerry?', 1, 'movie');

    expect(requestedUrls()).toEqual([
      'https://api.themoviedb.org/3/search/movie?query=Tom%20%26%20Jerry%3F&page=1',
    ]);
  });
});

describe('getWatchProviders', () => {
  const provider = {
    provider_id: 8,
    provider_name: 'Netflix',
    logo_path: '/n.jpg',
    display_priority: 1,
  };

  beforeEach(() => {
    route({
      '/movie/550': {
        id: 550,
        title: 'Fight Club',
        'watch/providers': {
          results: {
            US: { link: 'https://tmdb/us', flatrate: [provider] },
            DE: { link: 'https://tmdb/de', rent: [provider] },
          },
        },
      },
    });
  });

  it('returns only the requested region, trimmed to three fields', async () => {
    expect(await getWatchProviders('550', 'movie', 'US')).toEqual({
      link: 'https://tmdb/us',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.jpg' },
      ],
      rent: undefined,
      buy: undefined,
      ads: undefined,
      free: undefined,
    });
  });

  it('returns null for an absent region', async () => {
    expect(await getWatchProviders('550', 'movie', 'FR')).toBeNull();
  });
});

describe('getWikidataId', () => {
  it('returns external_ids.wikidata_id', async () => {
    route({
      '/tv/1399': { ...seriesPayload, external_ids: { wikidata_id: 'Q23572' } },
    });
    expect(await getWikidataId('1399', 'series')).toBe('Q23572');
  });

  it('returns null when absent', async () => {
    route({ '/movie/550': { id: 550, title: 'Fight Club' } });
    expect(await getWikidataId('550', 'movie')).toBeNull();
  });
});
