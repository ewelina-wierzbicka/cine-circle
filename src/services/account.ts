'use server';

import { adminSupabase } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const updateEmail = async (
  newEmail: string,
): Promise<{ error?: string }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) return { error: error.message };

  return {};
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Re-authenticate with the current password first.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) return { error: 'Current password is incorrect' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    const msg = error.message.includes('at least one character of each')
      ? 'Password should be at least 8 characters. It must contain uppercase, lowercase, number, and special character.'
      : error.message;
    return { error: msg };
  }

  return {};
};

export const deleteAccount = async (): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Fetch avatar path before deleting the user so we can queue storage cleanup.
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single();

  const avatarUrl = profile?.avatar_url;

  if (avatarUrl) {
    // Extract the storage object path from the full URL.
    const url = new URL(avatarUrl);
    const pathMatch = url.pathname.match(/\/object\/public\/avatars\/(.+)/);
    const objectPath = pathMatch?.[1];

    if (objectPath) {
      await adminSupabase.from('pending_deletions').insert({
        user_id: user.id,
        bucket_id: 'avatars',
        object_path: objectPath,
      });
    }
  }

  // Deleting the auth.users row cascades to both profiles and user_media.
  const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError)
    throw new Error('Failed to delete account. Please try again.');

  // Best-effort inline cleanup: process any queued storage deletions now.
  // Rows that fail to delete here remain in pending_deletions for future sweeps.
  if (avatarUrl) {
    const { data: pending } = await adminSupabase
      .from('pending_deletions')
      .select('id, bucket_id, object_path')
      .eq('user_id', user.id);

    if (pending?.length) {
      for (const row of pending) {
        const { error: storageError } = await adminSupabase.storage
          .from(row.bucket_id)
          .remove([row.object_path]);

        if (!storageError) {
          await adminSupabase
            .from('pending_deletions')
            .delete()
            .eq('id', row.id);
        }
      }
    }
  }

  redirect('/login');
};
