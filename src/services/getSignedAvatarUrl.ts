import { createClient } from '@/lib/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export const SIGNED_AVATAR_REUSE_MS = 30 * 60 * 1000;
export const SIGNED_AVATAR_MAX_ENTRIES = 500;

type Entry = { url: string; reuseUntil: number };

const signed = new Map<string, Entry>();

export const getSignedAvatarUrl = async (
  supabase: ServerClient,
  path: string,
  updatedAt: string,
): Promise<string> => {
  const key = `${updatedAt}\n${path}`;
  const now = Date.now();
  const reusable = signed.get(key);

  if (reusable && reusable.reuseUntil > now) return reusable.url;

  const { data, error } = await supabase.storage
    .from('avatar')
    .createSignedUrl(path, 60 * 60);

  if (error) throw new Error('Failed to load avatar image.');

  for (const [stale, entry] of signed) {
    if (entry.reuseUntil <= now) signed.delete(stale);
  }
  // `updateAvatarPath` bumps `updated_at` on every call, so one caller can mint
  // unbounded live keys inside a single reuse window. Map keeps insertion
  // order, so the first key is the oldest entry.
  while (signed.size >= SIGNED_AVATAR_MAX_ENTRIES) {
    const oldest = signed.keys().next();
    if (oldest.done) break;
    signed.delete(oldest.value);
  }
  signed.set(key, {
    url: data.signedUrl,
    reuseUntil: now + SIGNED_AVATAR_REUSE_MS,
  });

  return data.signedUrl;
};
