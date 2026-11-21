// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, eqFilters } from '@/test/supabaseMock';
import { deleteUserMedia } from '@/services/deleteUserMedia';

const supabase = createSupabaseMock();
const currentUser = vi.fn(
  async (): Promise<{ id: string } | null> => ({ id: 'user-1' }),
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

describe('deleteUserMedia', () => {
  it('throws Not authenticated with no user', async () => {
    currentUser.mockResolvedValueOnce(null);
    await expect(deleteUserMedia(3)).rejects.toThrow('Not authenticated');
    expect(supabase.chains('user_media')).toEqual([]);
  });

  // A delete missing the user_id filter would wipe other users' rows.
  it('scopes the delete by both id and user_id', async () => {
    supabase.respond('user_media', {});
    await deleteUserMedia(3);

    const [chain] = supabase.chains('user_media');
    expect(chain.steps.map(([name]) => name)).toEqual(['delete', 'eq', 'eq']);
    expect(eqFilters(chain)).toEqual([
      ['id', 3],
      ['user_id', 'user-1'],
    ]);
  });

  it('throws a user-facing message on a Supabase error', async () => {
    supabase.respond('user_media', { error: { message: 'boom' } });
    await expect(deleteUserMedia(3)).rejects.toThrow(
      'Failed to delete. Please try again.',
    );
  });
});
