// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock } from '@/test/supabaseMock';
import { requestScope } from '@/test/reactCache';
import { getProfile } from '@/services/getProfile';

type User = { id: string; user_metadata: Record<string, unknown> };

const supabase = createSupabaseMock();
const currentUser = vi.fn(
  async (): Promise<User | null> => ({ id: 'user-1', user_metadata: {} }),
);

// getProfile is wrapped in React `cache`, which only memoizes in the
// react-server build with a per-request dispatcher installed. See reactCache.
vi.mock('react', async () => ({
  cache: (await import('@/test/reactCache')).serverCache,
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('@/services/getCurrentUser', () => ({
  getCurrentUser: () => currentUser(),
}));
// getProfile reaches getSignedAvatarUrl through updateProfile, which revalidates.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

afterEach(() => {
  supabase.reset();
  currentUser.mockClear();
});

const row = {
  id: 'p1',
  user_id: 'user-1',
  display_name: 'Ewa',
  avatar_url: null,
};

describe('getProfile', () => {
  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(getProfile()).rejects.toThrow('Not authenticated');
  });

  it('rethrows a select error', async () => {
    supabase.respond('profiles', { error: { message: 'boom' } });
    await expect(getProfile()).rejects.toEqual({ message: 'boom' });
  });

  // The seeding upsert must never run against a row that already exists.
  it('returns an existing row without touching it', async () => {
    supabase.respond('profiles', { data: row });
    await expect(getProfile()).resolves.toEqual(row);

    expect(supabase.chains('profiles')).toHaveLength(1);
    const [chain] = supabase.chains('profiles');
    expect(argsOf(chain, 'upsert')).toBeUndefined();
  });

  it('rethrows an insert error', async () => {
    supabase.respond(
      'profiles',
      { data: null },
      { error: { message: 'insert boom' } },
    );
    await expect(getProfile()).rejects.toEqual({ message: 'insert boom' });
  });

  it.each<[string, Record<string, unknown>, string | null]>([
    ['full_name', { full_name: 'Ewa W', name: 'ignored' }, 'Ewa W'],
    ['name when full_name is absent', { name: 'Ewa W' }, 'Ewa W'],
    ['no identity name', {}, null],
    ['a non-string name', { full_name: 42 }, null],
    ['a whitespace-only name', { full_name: '   ' }, null],
  ])('seeds display_name from %s', async (_, user_metadata, expected) => {
    currentUser.mockResolvedValueOnce({ id: 'user-1', user_metadata });
    supabase.respond('profiles', { data: null }, { data: row });

    await getProfile();

    const insert = supabase.chains('profiles')[1];
    expect(argsOf(insert, 'upsert')).toEqual([
      { user_id: 'user-1', display_name: expected },
      { onConflict: 'user_id' },
    ]);
  });

  it('signs a stored avatar path', async () => {
    supabase.respond('profiles', {
      data: { ...row, avatar_url: 'user-1/a.webp' },
    });
    supabase.respond('storage:avatar', {
      data: { signedUrl: 'https://signed/a' },
    });

    await expect(getProfile()).resolves.toEqual({
      ...row,
      avatar_url: 'https://signed/a',
    });

    const [signing] = supabase.chains('storage:avatar');
    expect(argsOf(signing, 'createSignedUrl')).toEqual(['user-1/a.webp', 3600]);
  });

  it('queries profiles once for two calls in one request', async () => {
    supabase.respond('profiles', { data: row });

    const results = await requestScope(async () => [
      await getProfile(),
      await getProfile(),
    ]);

    expect(results).toEqual([row, row]);
    expect(supabase.chains('profiles')).toHaveLength(1);
  });

  it('queries profiles again in the next request', async () => {
    supabase.respond('profiles', { data: row }, { data: row });

    await requestScope(() => getProfile());
    await requestScope(() => getProfile());

    expect(supabase.chains('profiles')).toHaveLength(2);
  });

  it.each([
    ['an absolute avatar_url', 'https://cdn/a.webp'],
    ['no avatar_url', null],
  ])('does not sign %s', async (_, avatar_url) => {
    supabase.respond('profiles', { data: { ...row, avatar_url } });

    await expect(getProfile()).resolves.toEqual({ ...row, avatar_url });
    expect(supabase.chains('storage:avatar')).toEqual([]);
  });
});
