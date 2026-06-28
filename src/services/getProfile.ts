'use server';

import { createClient } from '@/lib/supabase/server';
import { getSignedAvatarUrl } from '@/services/updateProfile';
import { UserProfile } from '@/types';

export const getProfile = async (): Promise<UserProfile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, display_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) return resolveAvatarUrl(supabase, data as UserProfile);

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
    .select('id, user_id, display_name, avatar_url')
    .single();

  if (insertError) throw insertError;

  return resolveAvatarUrl(supabase, created as UserProfile);
};

const resolveAvatarUrl = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: UserProfile,
): Promise<UserProfile> => {
  if (!profile.avatar_url || profile.avatar_url.startsWith('http')) {
    return profile;
  }
  const signedUrl = await getSignedAvatarUrl(supabase, profile.avatar_url);
  return { ...profile, avatar_url: signedUrl };
};
