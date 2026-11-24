import { createClient } from '@/lib/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export const SIGNED_AVATAR_REUSE_MS = 30 * 60 * 1000;

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
  signed.set(key, {
    url: data.signedUrl,
    reuseUntil: now + SIGNED_AVATAR_REUSE_MS,
  });

  return data.signedUrl;
};
