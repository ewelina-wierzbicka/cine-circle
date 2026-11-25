'use server';

import { isRateLimited, reportAuthFailure } from '@/lib/authFailureAlert';
import { BOTID_CHECK_OPTIONS } from '@/lib/botIdRoutes';
import { captureSecurityEvent } from '@/lib/captureSecurityEvent';
import { safeRedirectPath } from '@/lib/safeRedirectPath';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/services/getCurrentUser';
import { checkBotId } from 'botid/server';
import { redirect } from 'next/navigation';

const BOT_REJECTED = 'Could not verify this request. Please try again.';

// `checkBotId` reads request headers, so it can never sit inside a `use cache`
// function. It returns a human verdict in local development.
async function isBotRequest() {
  let verification;

  try {
    verification = await checkBotId(BOTID_CHECK_OPTIONS);
  } catch {
    // Fails open, and reports it. `checkBotId` throws on a missing
    // `VERCEL_OIDC_TOKEN`, which no request can provoke, and throwing on would
    // lock every visitor out of all three forms.
    captureSecurityEvent('auth.botid_unavailable');
    return false;
  }

  if (!verification.isBot) return false;

  captureSecurityEvent('auth.botid_rejected');
  return true;
}

export async function login(email: string, password: string, rurl?: string) {
  if (await isBotRequest()) return { error: BOT_REJECTED };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (isRateLimited(error)) captureSecurityEvent('auth.rate_limited');
    else await reportAuthFailure();
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
  if (await isBotRequest()) return { error: BOT_REJECTED };

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
    if (isRateLimited(error)) captureSecurityEvent('auth.rate_limited');
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
  if (await isBotRequest()) return { error: BOT_REJECTED };

  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin)
    return {
      error: 'Server misconfiguration: NEXT_PUBLIC_SITE_URL is not set.',
    };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/reset-callback`,
  });

  if (error && isRateLimited(error)) captureSecurityEvent('auth.rate_limited');

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
