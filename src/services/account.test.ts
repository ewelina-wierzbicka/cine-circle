// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock, eqFilters } from '@/test/supabaseMock';
import { deleteAccount } from '@/services/account';

const supabase = createSupabaseMock();
const admin = createSupabaseMock();
const currentUser = vi.fn(
  async (): Promise<{ id: string } | null> => ({ id: 'user-1' }),
);
const redirect = vi.fn();

// How many deleted_accounts chains existed when deleteUser was called. The
// erasure log has to be written first, so this must be 1.
let logsAtDelete = -1;
const deleteUser = vi.fn<(id: string) => Promise<{ error?: unknown }>>(
  async () => {
    logsAtDelete = admin.chains('deleted_accounts').length;
    return { error: null };
  },
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: {
    from: (table: string) => admin.client.from(table),
    storage: { from: (bucket: string) => admin.client.storage.from(bucket) },
    auth: { admin: { deleteUser: (id: string) => deleteUser(id) } },
  },
}));
vi.mock('@/services/getCurrentUser', () => ({
  getCurrentUser: () => currentUser(),
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirect(path),
}));

afterEach(() => {
  supabase.reset();
  admin.reset();
  currentUser.mockClear();
  redirect.mockClear();
  deleteUser.mockClear();
  logsAtDelete = -1;
});

/**
 * Queues the happy path: one profile row, one avatar folder listing, the
 * storage removal, the erasure log.
 */
function happyPath({
  avatarUrl = null,
  folder = [{ name: 'a.webp' }],
}: { avatarUrl?: string | null; folder?: { name: string }[] } = {}) {
  supabase.respond('profiles', { data: { avatar_url: avatarUrl } });
  admin.respond('storage:avatar', { data: folder }, {});
  admin.respond('deleted_accounts', {});
}

const removedPaths = () =>
  admin
    .chains('storage:avatar')
    .flatMap((chain) => (argsOf(chain, 'remove')?.[0] as string[]) ?? []);

describe('deleteAccount', () => {
  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(deleteAccount()).rejects.toThrow('Not authenticated');
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('reads the profile row scoped to the user', async () => {
    happyPath();
    await deleteAccount();

    const [profile] = supabase.chains('profiles');
    expect(eqFilters(profile)).toEqual([['user_id', 'user-1']]);
  });

  // docs/BACKUPS.md section 6: the row has to outlive a crash after deleteUser.
  it('writes the erasure log before deleting the user', async () => {
    happyPath();
    await deleteAccount();

    const [log] = admin.chains('deleted_accounts');
    expect(argsOf(log, 'upsert')).toEqual([
      { user_id: 'user-1' },
      { onConflict: 'user_id', ignoreDuplicates: true },
    ]);
    expect(deleteUser).toHaveBeenCalledWith('user-1');
    expect(logsAtDelete).toBe(1);
  });

  it('redirects to /login once the user is gone', async () => {
    happyPath();
    await deleteAccount();
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('removes every object in the avatar folder', async () => {
    happyPath({ folder: [{ name: 'a.webp' }, { name: 'b.webp' }] });
    await deleteAccount();

    expect(removedPaths()).toEqual(['user-1/a.webp', 'user-1/b.webp']);
  });

  it('skips the removal when the folder is empty', async () => {
    happyPath({ folder: [] });
    await deleteAccount();

    expect(removedPaths()).toEqual([]);
    expect(deleteUser).toHaveBeenCalled();
  });

  it.each([
    [
      'a signed URL',
      'https://db.supabase.co/storage/v1/object/sign/avatar/user-1/legacy.webp?token=t',
    ],
    [
      'a public URL',
      'https://db.supabase.co/storage/v1/object/public/avatar/user-1/legacy.webp',
    ],
    ['a bare path', 'user-1/legacy.webp'],
  ])('also removes the legacy avatar_url from %s', async (_, avatarUrl) => {
    happyPath({ avatarUrl, folder: [] });
    await deleteAccount();

    expect(removedPaths()).toEqual(['user-1/legacy.webp']);
  });

  it.each([
    ['a non-storage URL', 'https://cdn.example.com/avatar/user-1/x.webp'],
    ['an unparseable URL', 'https://'],
  ])('ignores %s', async (_, avatarUrl) => {
    happyPath({ avatarUrl, folder: [] });
    await deleteAccount();

    expect(removedPaths()).toEqual([]);
  });

  it('dedupes the folder listing and the legacy path', async () => {
    happyPath({ avatarUrl: 'user-1/a.webp', folder: [{ name: 'a.webp' }] });
    await deleteAccount();

    expect(removedPaths()).toEqual(['user-1/a.webp']);
  });

  it('treats a failed folder listing as non-fatal', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    supabase.respond('profiles', { data: { avatar_url: null } });
    admin.respond('storage:avatar', { error: { message: 'list boom' } });
    admin.respond('deleted_accounts', {});

    await deleteAccount();

    expect(error).toHaveBeenCalled();
    expect(deleteUser).toHaveBeenCalledWith('user-1');
    error.mockRestore();
  });

  it('throws and keeps the user when the storage removal fails', async () => {
    supabase.respond('profiles', { data: { avatar_url: null } });
    admin.respond(
      'storage:avatar',
      { data: [{ name: 'a.webp' }] },
      { error: { message: 'remove boom' } },
    );

    await expect(deleteAccount()).rejects.toThrow(
      'Failed to delete account. Please try again.',
    );
    expect(admin.chains('deleted_accounts')).toEqual([]);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('throws and keeps the user when the erasure log fails', async () => {
    supabase.respond('profiles', { data: { avatar_url: null } });
    admin.respond('storage:avatar', { data: [] });
    admin.respond('deleted_accounts', { error: { message: 'log boom' } });

    await expect(deleteAccount()).rejects.toThrow(
      'Failed to delete account. Please try again.',
    );
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('throws and does not redirect when deleteUser fails', async () => {
    happyPath();
    deleteUser.mockResolvedValueOnce({ error: { message: 'delete boom' } });

    await expect(deleteAccount()).rejects.toThrow(
      'Failed to delete account. Please try again.',
    );
    expect(redirect).not.toHaveBeenCalled();
  });
});
