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

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  const storedAvatar = profile?.avatar_url;
  if (storedAvatar) {
    let objectPath: string | undefined;
    if (storedAvatar.startsWith('http')) {
      try {
        const url = new URL(storedAvatar);
        const pathMatch = url.pathname.match(
          /\/object\/(?:public|sign)\/avatar\/(.+)$/,
        );
        objectPath = pathMatch?.[1];
      } catch {
        objectPath = undefined;
      }
    } else {
      objectPath = storedAvatar;
    }

    if (objectPath) {
      const { error: storageError } = await adminSupabase.storage
        .from('avatar')
        .remove([objectPath]);
      if (storageError)
        throw new Error('Failed to delete account. Please try again.');
    }
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
  if (error) throw new Error('Failed to delete account. Please try again.');

  redirect('/login');
};
