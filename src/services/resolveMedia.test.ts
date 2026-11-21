import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveMedia } from '@/services/resolveMedia';

const UNRESOLVED = { exists: true, id: null, title: null };

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
