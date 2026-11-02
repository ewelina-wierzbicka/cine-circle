'use server';

import { safeRedirectPath } from '@/lib/safeRedirectPath';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/services/getCurrentUser';
import { redirect } from 'next/navigation';

export async function login(email: string, password: string, rurl?: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(safeRedirectPath(rurl) ?? '/');
}

export async function signInWithGoogle(rurl?: string) {
  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin)
    return {
      error: 'Server misconfiguration: NEXT_PUBLIC_SITE_URL is not set.',
    };

  // The server client writes the PKCE code-verifier cookie here;
  // /api/auth/oauth-callback reads it back to exchange the code.
  const callback = new URL('/api/auth/oauth-callback', origin);
  const destination = safeRedirectPath(rurl);
  if (destination) callback.searchParams.set('rurl', destination);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callback.toString() },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: 'Could not start Google sign-in. Please try again.' };
  }

  redirect(data.url);
}

export async function register(email: string, password: string) {
  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin)
    return {
      error: 'Server misconfiguration: NEXT_PUBLIC_SITE_URL is not set.',
    };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/api/auth/confirm-callback` },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/confirm-email');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
}

export async function sendPasswordReset(
  email: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin)
    return {
      error: 'Server misconfiguration: NEXT_PUBLIC_SITE_URL is not set.',
    };

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
  const user = await getCurrentUser();

  if (!user) return { error: 'Reset link expired or invalid' };

  // Only allow password update from a recovery session, not any authenticated session
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const isRecovery = aal?.currentAuthenticationMethods?.some((m) =>
    typeof m === 'string' ? m === 'recovery' : m.method === 'recovery',
  );
  if (!isRecovery) return { error: 'Reset link expired or invalid' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    const msg = error.message.includes('at least one character of each')
      ? 'Password should be at least 8 characters. It must contain uppercase, lowercase, number, and special character.'
      : error.message;
    return { error: msg };
  }

  return {};
}

export async function signOutOnly(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
