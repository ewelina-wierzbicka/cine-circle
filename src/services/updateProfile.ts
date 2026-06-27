'use server';

import { createClient } from '@/lib/supabase/server';

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

  if (error) throw error;
};

export const getAvatarUploadUrl = async (
  fileName: string,
): Promise<{ signedUrl: string; publicUrl: string }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('avatar')
    .createSignedUploadUrl(path);

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from('avatar')
    .getPublicUrl(path);

  return {
    signedUrl: data.signedUrl,
    publicUrl: publicData.publicUrl,
  };
};

export const updateAvatarUrl = async (avatarUrl: string): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;
};
