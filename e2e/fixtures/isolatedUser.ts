import { createServerClient } from '@supabase/ssr';
import { test as base, expect, type Cookie, type Page } from '@playwright/test';
import { admin } from '../admin';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../env';

// A fresh, pre-confirmed Supabase user per test, authed and torn down after.
// Mutating collection flows use this so they never pollute the shared user or
// each other. Mirrors the cookie-capture trick from fixtures/auth.ts but for
// arbitrary credentials.

type SetCookie = { name: string; value: string; options?: { maxAge?: number } };

async function sessionCookiesFor(
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

type IsolatedUser = { id: string; email: string; page: Page };

export const test = base.extend<{ isolatedUser: IsolatedUser }>({
  isolatedUser: async ({ context }, use, testInfo) => {
    const email = `e2e-iso-${Date.now()}-${testInfo.workerIndex}-${Math.random()
      .toString(36)
      .slice(2, 8)}@cinecircle.test`;
    const password = 'E2eIsolated!1';

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw error ?? new Error('Failed to create isolated user');
    }
    const userId = data.user.id;

    await context.addCookies(await sessionCookiesFor(email, password));
    const page = await context.newPage();

    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture callback, not a React hook
    await use({ id: userId, email, page });

    await admin.auth.admin.deleteUser(userId);
  },
});

export { expect };
