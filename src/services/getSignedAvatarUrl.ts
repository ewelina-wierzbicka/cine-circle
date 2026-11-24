import { createClient } from '@/lib/supabase/server';
import { signAvatarUrl } from '@/services/updateProfile';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export const SIGNED_AVATAR_REUSE_MS = 30 * 60 * 1000;

type Entry = { url: string; reuseUntil: number };

const signed = new Map<string, Entry>();

export const getSignedAvatarUrl = async (
  supabase: ServerClient,
  path: string,
): Promise<string> => {
  const now = Date.now();
  const reusable = signed.get(path);

  if (reusable && reusable.reuseUntil > now) return reusable.url;

  const url = await signAvatarUrl(supabase, path);

  for (const [key, entry] of signed) {
    if (entry.reuseUntil <= now) signed.delete(key);
  }
  signed.set(path, { url, reuseUntil: now + SIGNED_AVATAR_REUSE_MS });

  return url;
};
