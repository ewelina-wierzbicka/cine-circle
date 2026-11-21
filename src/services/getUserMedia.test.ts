import { afterEach, describe, expect, it, vi } from 'vitest';
import { PAGE_SIZE } from '@/lib/constants';
import { argsOf, createSupabaseMock, eqFilters } from '@/test/supabaseMock';
import { getUserMedia, getUserMediaList } from '@/services/getUserMedia';

const supabase = createSupabaseMock();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('@/services/getCurrentUser', () => ({
  getCurrentUser: async () => ({ id: 'user-1' }),
}));

afterEach(() => {
  supabase.reset();
});

const rows = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1 }));

describe('getUserMediaList', () => {
  it('returns the next page number after a full page', async () => {
    supabase.respond('user_media', { data: rows(PAGE_SIZE) });
    const { nextPage } = await getUserMediaList('watched', 2);

    expect(nextPage).toBe(3);
    expect(argsOf(supabase.chains('user_media')[0], 'range')).toEqual([
      2 * PAGE_SIZE,
      3 * PAGE_SIZE - 1,
    ]);
  });

  it('returns null after a short page', async () => {
    supabase.respond('user_media', { data: rows(PAGE_SIZE - 1) });
    expect((await getUserMediaList('watched', 0)).nextPage).toBeNull();
  });

  it('switches the join to media!inner for a media type filter', async () => {
    supabase.respond('user_media', { data: [] }, { data: [] });
    await getUserMediaList('to_watch', 0, 'series');
    await getUserMediaList('to_watch', 0);

    const [filtered, unfiltered] = supabase.chains('user_media');
    expect(argsOf(filtered, 'select')).toEqual(['*, media!inner(*)']);
    expect(eqFilters(filtered)).toContainEqual(['media.media_type', 'series']);
    expect(argsOf(unfiltered, 'select')).toEqual(['*, media(*)']);
  });
});

describe('getUserMedia', () => {
  it('throws an error carrying the Postgres code', async () => {
    supabase.respond('user_media', {
      error: { code: 'PGRST116', message: 'no rows' },
    });

    await expect(getUserMedia(550, 'movie')).rejects.toMatchObject({
      message: 'Failed to load saved data.',
      code: 'PGRST116',
    });
  });
});
