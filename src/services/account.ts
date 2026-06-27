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

  // Deleting the auth.users row cascades to both profiles and user_media.
  const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) throw deleteError;

  redirect('/login');
};
