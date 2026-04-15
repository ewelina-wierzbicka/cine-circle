'use server';

import { createClient } from '@/lib/supabase/server';
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

  if (data) return data as UserProfile;

  // No profile row yet — create a blank one and return it.
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
    .select('id, user_id, display_name, avatar_url')
    .single();

  if (insertError) throw insertError;

  return created as UserProfile;
};
