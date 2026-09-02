import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from './env';

// Service-role client. Server-side only, in tests only. Bypasses RLS.
export const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function findUserByEmail(email: string) {
  // linear scan of first page. Test project has few users.
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

export async function deleteUserByEmail(email: string) {
  const user = await findUserByEmail(email);
  if (user) await admin.auth.admin.deleteUser(user.id);
}

// Complete a password reset the way the app does: authenticate with a genuine
// recovery token, then updateUser({ password }). Drives the same Supabase
// change the /reset-password form triggers, without the emailed PKCE code
// (unavailable offline). Lets a test then prove login with the new password.
export async function resetPasswordViaRecovery(
  email: string,
  newPassword: string,
) {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: 'http://localhost:3000/api/auth/reset-callback' },
  });
  if (error || !data.properties) {
    throw error ?? new Error('Failed to generate recovery link');
  }

  // Following the action link lands on the callback with the session tokens in
  // the URL hash. Parse them to authenticate as the recovery user.
  const res = await fetch(data.properties.action_link, { redirect: 'manual' });
  const location = res.headers.get('location');
  if (!location) throw new Error('Recovery link did not redirect');
  const hash = new URL(location).hash.slice(1);
  const tokens = new URLSearchParams(hash);
  const accessToken = tokens.get('access_token');
  const refreshToken = tokens.get('refresh_token');
  if (!accessToken || !refreshToken) {
    throw new Error('Recovery redirect missing session tokens');
  }

  const recovery = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await recovery.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  const { error: updateError } = await recovery.auth.updateUser({
    password: newPassword,
  });
  if (updateError) throw updateError;
}
