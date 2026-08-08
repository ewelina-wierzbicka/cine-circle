import { createServerClient } from '@supabase/ssr';
import { type Cookie } from '@playwright/test';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../env';

type SetCookie = { name: string; value: string; options?: { maxAge?: number } };

// Log in via Supabase REST (signInWithPassword), capturing the exact cookies
// @supabase/ssr would write so the app's server client reads a valid session.
// No UI involved. Shared by the persistent-user and isolated-user fixtures.
export async function sessionCookiesFor(
  email: string,
  password: string,
): Promise<Cookie[]> {
  const jar: SetCookie[] = [];
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => jar.map(({ name, value }) => ({ name, value })),
      setAll: (cookies) => {
        jar.push(...cookies);
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  return jar.map(({ name, value, options }) => ({
    name,
    value,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax' as const,
    expires: options?.maxAge
      ? Math.floor(Date.now() / 1000) + options.maxAge
      : -1,
  }));
}
