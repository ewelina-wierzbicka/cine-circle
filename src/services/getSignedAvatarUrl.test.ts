// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock } from '@/test/supabaseMock';
import {
  SIGNED_AVATAR_REUSE_MS,
  getSignedAvatarUrl,
} from '@/services/getSignedAvatarUrl';

const supabase = createSupabaseMock();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
// signAvatarUrl lives in updateProfile, which revalidates.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

type ServerClient = Parameters<typeof getSignedAvatarUrl>[0];
const client = supabase.client as unknown as ServerClient;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  supabase.reset();
});

describe('getSignedAvatarUrl', () => {
  it('reuses the signed URL for a repeat sign of the same path', async () => {
    supabase.respond('storage:avatar', { data: { signedUrl: 'https://a/1' } });

    const first = await getSignedAvatarUrl(client, 'reuse/avatar.webp');
    vi.advanceTimersByTime(SIGNED_AVATAR_REUSE_MS - 1);
    const second = await getSignedAvatarUrl(client, 'reuse/avatar.webp');

    expect(second).toBe(first);
    expect(supabase.chains('storage:avatar')).toHaveLength(1);
  });

  it('signs a different path separately', async () => {
    supabase.respond(
      'storage:avatar',
      { data: { signedUrl: 'https://a/mine' } },
      { data: { signedUrl: 'https://a/theirs' } },
    );

    await expect(getSignedAvatarUrl(client, 'mine/avatar.webp')).resolves.toBe(
      'https://a/mine',
    );
    await expect(
      getSignedAvatarUrl(client, 'theirs/avatar.webp'),
    ).resolves.toBe('https://a/theirs');

    const chains = supabase.chains('storage:avatar');
    expect(chains).toHaveLength(2);
    expect(argsOf(chains[0], 'createSignedUrl')).toEqual([
      'mine/avatar.webp',
      3600,
    ]);
    expect(argsOf(chains[1], 'createSignedUrl')).toEqual([
      'theirs/avatar.webp',
      3600,
    ]);
  });

  it('re-signs once the reuse window has passed', async () => {
    supabase.respond(
      'storage:avatar',
      { data: { signedUrl: 'https://a/stale' } },
      { data: { signedUrl: 'https://a/fresh' } },
    );

    await expect(
      getSignedAvatarUrl(client, 'expiry/avatar.webp'),
    ).resolves.toBe('https://a/stale');
    vi.advanceTimersByTime(SIGNED_AVATAR_REUSE_MS + 1);

    await expect(
      getSignedAvatarUrl(client, 'expiry/avatar.webp'),
    ).resolves.toBe('https://a/fresh');
    expect(supabase.chains('storage:avatar')).toHaveLength(2);
  });

  // The reuse window must stay safely inside the one hour signed-URL expiry.
  it('reuses for less than the signed URL lifetime', () => {
    expect(SIGNED_AVATAR_REUSE_MS).toBeLessThan(60 * 60 * 1000);
  });
});
