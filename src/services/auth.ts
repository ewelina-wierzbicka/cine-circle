'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(email: string, password: string, rurl?: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const destination = rurl?.startsWith('/') ? rurl : '/';
  redirect(destination);
}

export async function register(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Redirect to confirm email page after registration
  redirect('/confirm-email');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function sendPasswordReset(
  email: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  let origin = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  if (!origin) {
    const headersList = await headers();
    const proto = headersList.get('x-forwarded-proto') ?? 'https';
    const host = headersList.get('host') ?? '';
    if (host) origin = `${proto}://${host}`;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/reset-callback`,
  });

  // ponytail: treat user-not-found as success to prevent account enumeration
  if (error && !error.message.toLowerCase().includes('user not found')) {
    return { error: error.message };
  }

  return {};
}

export async function updatePasswordAfterReset(
  newPassword: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Reset link expired or invalid' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    const msg = error.message.includes('at least one character of each')
      ? 'Password should be at least 8 characters. It must contain uppercase, lowercase, number, and special character.'
      : error.message;
    return { error: msg };
  }

  return {};
}
