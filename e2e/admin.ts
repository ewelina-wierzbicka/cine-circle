import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from './env';

// Service-role client. Server-side only, in tests only. Bypasses RLS.
export const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function findUserByEmail(email: string) {
  // ponytail: linear scan of first page. Test project has few users.
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

export async function deleteUserByEmail(email: string) {
  const user = await findUserByEmail(email);
  if (user) await admin.auth.admin.deleteUser(user.id);
}
