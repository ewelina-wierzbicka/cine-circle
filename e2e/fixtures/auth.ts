import { createServerClient } from '@supabase/ssr';
import { test as base, expect, type Cookie, type Page } from '@playwright/test';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from '../env';

type SetCookie = { name: string; value: string; options?: { maxAge?: number } };

// Log in via Supabase REST (signInWithPassword), capturing the exact cookies
// @supabase/ssr would write so the app's server client reads a valid session.
// No UI involved.
async function sessionCookies(): Promise<Cookie[]> {
  const jar: SetCookie[] = [];
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => jar.map(({ name, value }) => ({ name, value })),
      setAll: (cookies) => {
        jar.push(...cookies);
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });
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

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ context }, use) => {
    await context.addCookies(await sessionCookies());
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture callback, not a React hook
    await use(page);
  },
});

export { expect };
