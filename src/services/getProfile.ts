import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/services/getCurrentUser';
import { getSignedAvatarUrl } from '@/services/getSignedAvatarUrl';
import { UserProfile } from '@/types';
import { cache } from 'react';

// `updated_at` is read for the signed-URL cache key only, never returned.
const COLUMNS = 'id, user_id, display_name, avatar_url, updated_at';

type ProfileRow = UserProfile & { updated_at: string };

export const getProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser();

  if (!user) throw new Error('Not authenticated');

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) return resolveAvatarUrl(supabase, data as ProfileRow);

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: user.id,
        display_name: identityDisplayName(user.user_metadata),
      },
      { onConflict: 'user_id' },
    )
    .select(COLUMNS)
    .single();

  if (insertError) throw insertError;

  return resolveAvatarUrl(supabase, created as ProfileRow);
});

const identityDisplayName = (
  metadata: Record<string, unknown>,
): string | null => {
  const name = metadata.full_name ?? metadata.name;
  if (typeof name !== 'string') return null;
  return name.trim() || null;
};

const resolveAvatarUrl = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: ProfileRow,
): Promise<UserProfile> => {
  const { updated_at, ...profile } = row;

  if (!profile.avatar_url || profile.avatar_url.startsWith('http')) {
    return profile;
  }
  const signedUrl = await getSignedAvatarUrl(
    supabase,
    profile.avatar_url,
    updated_at,
  );
  return { ...profile, avatar_url: signedUrl };
};
