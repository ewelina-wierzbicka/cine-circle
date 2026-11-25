// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { argsOf, createSupabaseMock } from '@/test/supabaseMock';
import {
  SIGNED_AVATAR_MAX_ENTRIES,
  SIGNED_AVATAR_REUSE_MS,
  getSignedAvatarUrl,
} from '@/services/getSignedAvatarUrl';

const supabase = createSupabaseMock();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));

type ServerClient = Parameters<typeof getSignedAvatarUrl>[0];
const client = supabase.client as unknown as ServerClient;

const V1 = '2026-11-24T10:00:00.000Z';
const V2 = '2026-11-24T11:00:00.000Z';

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

    const first = await getSignedAvatarUrl(client, 'reuse/avatar.webp', V1);
    vi.advanceTimersByTime(SIGNED_AVATAR_REUSE_MS - 1);
    const second = await getSignedAvatarUrl(client, 'reuse/avatar.webp', V1);

    expect(second).toBe(first);
    expect(supabase.chains('storage:avatar')).toHaveLength(1);
  });

  // The avatar file is replaced in place, so the path alone cannot tell a new
  // upload from the old one. A bumped `updated_at` is what re-signs.
  it('re-signs the same path after updated_at changes', async () => {
    supabase.respond(
      'storage:avatar',
      { data: { signedUrl: 'https://a/old' } },
      { data: { signedUrl: 'https://a/new' } },
    );

    await expect(
      getSignedAvatarUrl(client, 'replaced/avatar.webp', V1),
    ).resolves.toBe('https://a/old');
    await expect(
      getSignedAvatarUrl(client, 'replaced/avatar.webp', V2),
    ).resolves.toBe('https://a/new');

    expect(supabase.chains('storage:avatar')).toHaveLength(2);
  });

  it('signs a different path separately', async () => {
    supabase.respond(
      'storage:avatar',
      { data: { signedUrl: 'https://a/mine' } },
      { data: { signedUrl: 'https://a/theirs' } },
    );

    await expect(
      getSignedAvatarUrl(client, 'mine/avatar.webp', V1),
    ).resolves.toBe('https://a/mine');
    await expect(
      getSignedAvatarUrl(client, 'theirs/avatar.webp', V1),
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
      getSignedAvatarUrl(client, 'expiry/avatar.webp', V1),
    ).resolves.toBe('https://a/stale');
    vi.advanceTimersByTime(SIGNED_AVATAR_REUSE_MS + 1);

    await expect(
      getSignedAvatarUrl(client, 'expiry/avatar.webp', V1),
    ).resolves.toBe('https://a/fresh');
    expect(supabase.chains('storage:avatar')).toHaveLength(2);
  });

  it('throws when signing fails', async () => {
    supabase.respond('storage:avatar', { error: { message: 'denied' } });

    await expect(
      getSignedAvatarUrl(client, 'denied/avatar.webp', V1),
    ).rejects.toThrow('Failed to load avatar image.');
  });

  // `updated_at` is part of the key and a caller can bump it in a loop, so the
  // map must hold at the cap and shed its oldest entry, not grow.
  it('caps live entries and evicts the oldest first', async () => {
    const fill = Array.from({ length: SIGNED_AVATAR_MAX_ENTRIES + 1 }, () => ({
      data: { signedUrl: 'https://a/fill' },
    }));
    supabase.respond(
      'storage:avatar',
      ...fill,
      { data: { signedUrl: 'https://a/evicted-resign' } },
      { data: { signedUrl: 'https://a/unused' } },
    );

    for (let i = 0; i < SIGNED_AVATAR_MAX_ENTRIES; i++) {
      await getSignedAvatarUrl(client, `cap-${i}/avatar.webp`, V1);
    }
    const filled = supabase.chains('storage:avatar').length;

    // One past the cap: the first path signed is the one that goes.
    await getSignedAvatarUrl(client, 'cap-overflow/avatar.webp', V1);

    // The second oldest is still cached, so exactly one entry was dropped.
    await expect(
      getSignedAvatarUrl(client, 'cap-1/avatar.webp', V1),
    ).resolves.toBe('https://a/fill');

    await expect(
      getSignedAvatarUrl(client, 'cap-0/avatar.webp', V1),
    ).resolves.toBe('https://a/evicted-resign');

    expect(filled).toBe(SIGNED_AVATAR_MAX_ENTRIES);
    expect(supabase.chains('storage:avatar')).toHaveLength(
      SIGNED_AVATAR_MAX_ENTRIES + 2,
    );
  });

  // The reuse window must stay safely inside the one hour signed-URL expiry.
  it('reuses for less than the signed URL lifetime', () => {
    expect(SIGNED_AVATAR_REUSE_MS).toBeLessThan(60 * 60 * 1000);
  });
});
