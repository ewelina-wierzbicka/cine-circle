import { createServerClient } from '@supabase/ssr';
import { test as base, expect, type Cookie, type Page } from '@playwright/test';
import { admin, deleteUserByEmail } from '../admin';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from '../env';

// A throwaway account owned by a single test. Use for destructive flows
// (e.g. account deletion) that must never touch the shared persistent user.
export type IsolatedUser = { email: string; password: string };

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

export const test = base.extend<{
  authedPage: Page;
  isolatedUser: IsolatedUser;
}>({
  authedPage: async ({ context }, use) => {
    await context.addCookies(await sessionCookies());
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture callback, not a React hook
    await use(page);
  },
  isolatedUser: async ({}, use) => {
    const email = `e2e-del-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}@cinecircle.test`;
    const password = 'E2eIsolated!1';
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture callback, not a React hook
    await use({ email, password });
    // Idempotent cleanup: the delete-account test removes the user itself.
    await deleteUserByEmail(email);
  },
});

export { expect };
