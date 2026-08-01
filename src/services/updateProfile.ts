'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const updateDisplayName = async (displayName: string): Promise<void> => {
  if (displayName.length > 50) {
    throw new Error('Display name must be 50 characters or fewer');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error('Failed to update name. Please try again.');

  revalidatePath('/', 'layout');
};

export const updateAvatarPath = async (
  filePath: string,
): Promise<{ avatarUrl: string }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single();

  if (profile?.avatar_url && profile.avatar_url !== filePath) {
    const { error: deleteError } = await supabase.storage
      .from('avatar')
      .remove([profile.avatar_url]);
    if (deleteError)
      throw new Error('Failed to update avatar. Please try again.');
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      avatar_url: filePath,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error('Failed to update avatar. Please try again.');

  revalidatePath('/', 'layout');

  return { avatarUrl: await getSignedAvatarUrl(supabase, filePath) };
};

export const getSignedAvatarUrl = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('avatar')
    .createSignedUrl(path, 60 * 60);

  if (error) throw new Error('Failed to load avatar image.');
  return data.signedUrl;
};
