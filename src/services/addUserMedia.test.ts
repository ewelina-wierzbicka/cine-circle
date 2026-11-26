// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock, eqFilters } from '@/test/supabaseMock';
import { addUserMedia, updateUserMedia } from '@/services/addUserMedia';
import type { NormalizedMedia, UserEntry } from '@/types';

const supabase = createSupabaseMock();
const admin = createSupabaseMock();
const tmdb = vi.fn(async (): Promise<Partial<NormalizedMedia> | null> => ({
  title: 'Fight Club',
  release_date: '1999-10-15',
  poster_path: '/tmdb-poster.jpg',
}));
const currentUser = vi.fn(async (): Promise<{ id: string } | null> => ({
  id: 'user-1',
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('@/lib/supabase/admin', () => ({
  get adminSupabase() {
    return admin.client;
  },
}));
vi.mock('@/services/getMedia', () => ({
  getMovieDetails: () => tmdb(),
  getSeriesDetails: () => tmdb(),
}));
vi.mock('@/services/getCurrentUser', () => ({
  getCurrentUser: () => currentUser(),
}));

afterEach(() => {
  supabase.reset();
  admin.reset();
  tmdb.mockClear();
  currentUser.mockClear();
});

const details = { id: 550, media_type: 'movie' as const };

const watched: UserEntry = {
  watchStatus: 'watched',
  watched_date: '2026-11-01',
  rating: 8,
  review: 'Great.',
};

// A to_watch entry still carrying watched fields, as a form might send it.
const toWatch: UserEntry = { ...watched, watchStatus: 'to_watch' };

function savedMedia(existingEntry: { id: number } | null) {
  admin.respond('media', { data: { id: 7 } });
  supabase.respond('user_media', { data: existingEntry }, {});
}

describe('addUserMedia', () => {
  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(addUserMedia(details, watched)).rejects.toThrow(
      'Not authenticated',
    );
  });

  it('writes the shared media row from TMDB, not the caller', async () => {
    savedMedia(null);
    await addUserMedia(details, watched);

    const [media] = admin.chains('media');
    expect(argsOf(media, 'upsert')).toEqual([
      {
        tmdb_id: 550,
        media_type: 'movie',
        title: 'Fight Club',
        release_date: '1999-10-15',
        last_air_date: undefined,
        poster_path: '/tmdb-poster.jpg',
      },
      { onConflict: 'tmdb_id,media_type' },
    ]);
    expect(supabase.chains('media')).toHaveLength(0);
  });

  it('saves nothing when TMDB does not know the id', async () => {
    tmdb.mockResolvedValueOnce(null);
    await expect(addUserMedia(details, watched)).rejects.toThrow(
      'Failed to save',
    );
    expect(admin.chains('media')).toHaveLength(0);
    expect(supabase.chains('user_media')).toHaveLength(0);
  });

  it('drops watched_date, rating and review from a to_watch entry', async () => {
    savedMedia(null);
    await expect(addUserMedia(details, toWatch)).resolves.toEqual({
      status: 'inserted',
    });

    const insert = supabase.chains('user_media')[1];
    expect(argsOf(insert, 'insert')).toEqual([
      {
        user_id: 'user-1',
        media_id: 7,
        watchStatus: 'to_watch',
        watched_date: undefined,
        rating: undefined,
        review: undefined,
      },
    ]);
  });

  it('returns duplicate for an existing row added as to_watch', async () => {
    savedMedia({ id: 3 });
    await expect(addUserMedia(details, toWatch)).resolves.toEqual({
      status: 'duplicate',
    });
    expect(supabase.chains('user_media')).toHaveLength(1);
  });

  it('updates an existing row added as watched', async () => {
    savedMedia({ id: 3 });
    await expect(addUserMedia(details, watched)).resolves.toEqual({
      status: 'inserted',
    });

    const update = supabase.chains('user_media')[1];
    expect(argsOf(update, 'update')).toEqual([
      {
        watchStatus: 'watched',
        watched_date: '2026-11-01',
        rating: 8,
        review: 'Great.',
      },
    ]);
  });

  it('scopes the update by both id and user_id', async () => {
    savedMedia({ id: 3 });
    await addUserMedia(details, watched);

    const update = supabase.chains('user_media')[1];
    expect(eqFilters(update)).toEqual([
      ['id', 3],
      ['user_id', 'user-1'],
    ]);
  });

  // One proof that the bounds run before any write. The bounds themselves are
  // covered in lib/userMediaColumns.test.ts.
  it('writes nothing when the review is too long', async () => {
    savedMedia(null);
    await expect(
      addUserMedia(details, { ...watched, review: 'a'.repeat(2001) }),
    ).rejects.toThrow('up to 2000 characters');
    expect(supabase.chains('user_media')).toHaveLength(0);
    expect(admin.chains('media')).toHaveLength(0);
  });
});

describe('updateUserMedia', () => {
  it('updates only the four writable columns', async () => {
    supabase.respond('user_media', {});
    const entry = {
      ...watched,
      user_id: 'someone-else',
      media_id: 42,
      added_at: '1999-01-01',
    } as UserEntry;

    await updateUserMedia(3, entry);

    const [update] = supabase.chains('user_media');
    expect(argsOf(update, 'update')).toEqual([
      {
        watchStatus: 'watched',
        watched_date: '2026-11-01',
        rating: 8,
        review: 'Great.',
      },
    ]);
    expect(eqFilters(update)).toEqual([
      ['id', 3],
      ['user_id', 'user-1'],
    ]);
  });
});
