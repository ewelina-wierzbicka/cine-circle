// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock } from '@/test/supabaseMock';
import { updateAvatarPath, updateDisplayName } from '@/services/updateProfile';

const supabase = createSupabaseMock();
const currentUser = vi.fn(async (): Promise<{ id: string } | null> => ({
  id: 'user-1',
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('@/services/getCurrentUser', () => ({
  getCurrentUser: () => currentUser(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

afterEach(() => {
  supabase.reset();
  currentUser.mockClear();
});

describe('updateDisplayName', () => {
  it('rejects a name over 50 characters before any Supabase call', async () => {
    await expect(updateDisplayName('x'.repeat(51))).rejects.toThrow(
      'Display name must be 50 characters or fewer',
    );
    expect(supabase.createClient).not.toHaveBeenCalled();
    expect(currentUser).not.toHaveBeenCalled();
  });

  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(updateDisplayName('Ewa')).rejects.toThrow('Not authenticated');
    expect(supabase.chains('profiles')).toEqual([]);
  });
});

describe('updateAvatarPath', () => {
  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(updateAvatarPath('user-1/new.webp')).rejects.toThrow(
      'Not authenticated',
    );
  });

  it.each([
    ['another user folder', 'user-2/avatar.webp'],
    ['no folder', 'avatar.webp'],
    ['a nested path', 'user-1/nested/avatar.webp'],
    ['a traversal segment', 'user-1/..'],
    ['an absolute URL', 'http://evil.com/track.png'],
    ['a prefix collision', 'user-10/avatar.webp'],
    ['an over-long filename', `user-1/${'a'.repeat(129)}.webp`],
    ['an empty string', ''],
  ])('rejects %s before touching the profile row', async (_label, path) => {
    await expect(updateAvatarPath(path)).rejects.toThrow('Invalid avatar path.');
    expect(supabase.chains('profiles')).toEqual([]);
    expect(supabase.chains('storage:avatar')).toEqual([]);
  });

  it('accepts a path inside the user folder', async () => {
    supabase.respond('profiles', { data: { avatar_url: null } });
    supabase.respond('storage:avatar', {
      data: { signedUrl: 'https://signed/ok' },
    });

    await expect(updateAvatarPath('user-1/avatar.webp')).resolves.toEqual({
      avatarUrl: 'https://signed/ok',
    });
  });

  it('removes the previous object when the path changed', async () => {
    supabase.respond(
      'profiles',
      { data: { avatar_url: 'user-1/old.webp' } },
      { data: { updated_at: '2026-11-24T10:00:00.000Z' } },
    );
    supabase.respond(
      'storage:avatar',
      {},
      { data: { signedUrl: 'https://signed/new' } },
    );

    await expect(updateAvatarPath('user-1/new.webp')).resolves.toEqual({
      avatarUrl: 'https://signed/new',
    });

    const [removal] = supabase.chains('storage:avatar');
    expect(argsOf(removal, 'remove')).toEqual([['user-1/old.webp']]);
  });

  it('does not remove when the path is unchanged', async () => {
    supabase.respond(
      'profiles',
      { data: { avatar_url: 'user-1/same.webp' } },
      { data: { updated_at: '2026-11-24T10:00:00.000Z' } },
    );
    supabase.respond('storage:avatar', {
      data: { signedUrl: 'https://signed/same' },
    });

    await updateAvatarPath('user-1/same.webp');

    const removals = supabase
      .chains('storage:avatar')
      .filter((chain) => argsOf(chain, 'remove'));
    expect(removals).toEqual([]);
  });
});
