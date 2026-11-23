// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const UNRESOLVED = { exists: true, id: null, title: null };
const MISSING = { exists: false, id: null, title: null };
const FIGHT_CLUB = { exists: true, id: 550, title: 'Fight Club' };

const fetchMock = vi.fn<typeof fetch>();

type ResolveMedia = typeof import('@/services/resolveMedia').resolveMedia;

// The module memoizes in module scope, so each test needs a fresh instance.
let resolveMedia: ResolveMedia;

beforeEach(async () => {
  vi.stubEnv('TMDB_TOKEN', 'test-token');
  vi.stubGlobal('fetch', fetchMock);
  vi.resetModules();
  ({ resolveMedia } = await import('@/services/resolveMedia'));
});

afterEach(() => {
  fetchMock.mockReset();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
}

describe('resolveMedia', () => {
  it('fails open with no fetch when TMDB_TOKEN is missing', async () => {
    vi.stubEnv('TMDB_TOKEN', '');

    expect(await resolveMedia('movie', '550')).toEqual(UNRESOLVED);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a 404 as missing', async () => {
    respond({ status_message: 'not found' }, 404);
    expect(await resolveMedia('movie', '999999999')).toEqual({
      exists: false,
      id: null,
      title: null,
    });
  });

  it('fails open on a 500', async () => {
    respond({}, 500);
    expect(await resolveMedia('movie', '550')).toEqual(UNRESOLVED);
  });

  it('fails open on a network error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    expect(await resolveMedia('movie', '550')).toEqual(UNRESOLVED);
  });

  it('reads title for a movie', async () => {
    respond({ id: 550, title: 'Fight Club', name: 'wrong field' });
    expect(await resolveMedia('movie', '550')).toEqual({
      exists: true,
      id: 550,
      title: 'Fight Club',
    });
  });

  it('reads name for a series', async () => {
    respond({ id: 1399, name: 'Game of Thrones', title: 'wrong field' });
    expect(await resolveMedia('series', '1399')).toEqual({
      exists: true,
      id: 1399,
      title: 'Game of Thrones',
    });
  });

  it('fails open on a series payload that only carries title', async () => {
    respond({ id: 1399, title: 'Game of Thrones' });
    expect(await resolveMedia('series', '1399')).toEqual(UNRESOLVED);
  });

  it('fails open on a non-numeric id in the payload', async () => {
    respond({ id: '550', title: 'Fight Club' });
    expect(await resolveMedia('movie', '550')).toEqual(UNRESOLVED);
  });

  it.each([
    ['movie', 'https://api.themoviedb.org/3/movie/550'],
    ['series', 'https://api.themoviedb.org/3/tv/550'],
  ] as const)(
    'requests the %s endpoint with the bearer token',
    async (type, url) => {
      respond({});
      await resolveMedia(type, '550');

      expect(fetchMock).toHaveBeenCalledWith(url, {
        headers: { Authorization: 'Bearer test-token' },
      });
    },
  );
});

// A warm instance only: a cold one must behave exactly as an uncached module.
describe('resolveMedia instance cache', () => {
  it('serves a repeat lookup for the same id from one fetch', async () => {
    respond({ id: 550, title: 'Fight Club' });

    expect(await resolveMedia('movie', '550')).toEqual(FIGHT_CLUB);
    expect(await resolveMedia('movie', '550')).toEqual(FIGHT_CLUB);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('caches a missing id, the case a bot repeats most', async () => {
    respond({ status_message: 'not found' }, 404);

    expect(await resolveMedia('movie', '999999999')).toEqual(MISSING);
    expect(await resolveMedia('movie', '999999999')).toEqual(MISSING);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never caches a failed lookup, so an outage cannot freeze a soft 404', async () => {
    respond({}, 500);
    expect(await resolveMedia('movie', '550')).toEqual(UNRESOLVED);

    respond({ id: 550, title: 'Fight Club' });
    expect(await resolveMedia('movie', '550')).toEqual(FIGHT_CLUB);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('keys the cache by media type as well as id', async () => {
    respond({ id: 550, title: 'Fight Club' });
    respond({ id: 550, name: 'Fight Club: The Series' });

    expect(await resolveMedia('movie', '550')).toEqual(FIGHT_CLUB);
    expect(await resolveMedia('series', '550')).toEqual({
      exists: true,
      id: 550,
      title: 'Fight Club: The Series',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('re-fetches an entry past its TTL', async () => {
    vi.useFakeTimers();

    respond({ id: 550, title: 'Fight Club' });
    expect(await resolveMedia('movie', '550')).toEqual(FIGHT_CLUB);

    vi.advanceTimersByTime(10 * 60 * 1000);

    respond({ id: 550, title: 'Fight Club' });
    expect(await resolveMedia('movie', '550')).toEqual(FIGHT_CLUB);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('evicts the oldest entry once the cap is reached', async () => {
    for (let id = 0; id < 500; id += 1) {
      respond({ id, title: `Movie ${id}` });
      await resolveMedia('movie', String(id));
    }
    expect(fetchMock).toHaveBeenCalledTimes(500);

    // The 501st insert drops id 0, so it costs a fetch on the next lookup.
    respond({ id: 500, title: 'Movie 500' });
    await resolveMedia('movie', '500');

    respond({ id: 0, title: 'Movie 0' });
    await resolveMedia('movie', '0');
    expect(fetchMock).toHaveBeenCalledTimes(502);

    // The newest entries are still warm.
    await resolveMedia('movie', '499');
    expect(fetchMock).toHaveBeenCalledTimes(502);
  });
});
