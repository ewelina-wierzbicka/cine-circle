import { afterEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock, eqFilters } from '@/test/supabaseMock';
import { addUserMedia } from '@/services/addUserMedia';
import type { NormalizedMedia, UserEntry } from '@/types';

const supabase = createSupabaseMock();
const currentUser = vi.fn(
  async (): Promise<{ id: string } | null> => ({
    id: 'user-1',
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('@/services/getCurrentUser', () => ({
  getCurrentUser: () => currentUser(),
}));

afterEach(() => {
  supabase.reset();
  currentUser.mockClear();
});

const details: NormalizedMedia = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
  poster_path: '/poster.jpg',
};

const watched: UserEntry = {
  watchStatus: 'watched',
  watched_date: '2026-11-01',
  rating: 8,
  review: 'Great.',
};

// A to_watch entry still carrying watched fields, as a form might send it.
const toWatch: UserEntry = { ...watched, watchStatus: 'to_watch' };

function savedMedia(existingEntry: { id: number } | null) {
  supabase.respond('media', { data: { id: 7 } });
  supabase.respond('user_media', { data: existingEntry }, {});
}

describe('addUserMedia', () => {
  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(addUserMedia(details, watched)).rejects.toThrow(
      'Not authenticated',
    );
  });

  it("upserts the media row on conflict of 'tmdb_id,media_type'", async () => {
    savedMedia(null);
    await addUserMedia(details, watched);

    const [media] = supabase.chains('media');
    expect(argsOf(media, 'upsert')?.[1]).toEqual({
      onConflict: 'tmdb_id,media_type',
    });
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
});
