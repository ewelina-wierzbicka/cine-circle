import { test as base, expect, type Page } from '@playwright/test';
import { admin, deleteUserByEmail } from '../admin';
import { sessionCookiesFor } from './session';

// A fresh, pre-confirmed Supabase user per test, authed with its own page and
// torn down after. Mutating and destructive flows use this so they never
// pollute the shared user or each other.
export type IsolatedUser = {
  id: string;
  email: string;
  password: string;
  page: Page;
};

export const test = base.extend<{ isolatedUser: IsolatedUser }>({
  isolatedUser: async ({ context }, use, testInfo) => {
    const email = `e2e-iso-${Date.now()}-${testInfo.workerIndex}-${Math.random()
      .toString(36)
      .slice(2, 8)}@midnightframe.test`;
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
    await use({ id: userId, email, password, page });

    // Idempotent: the delete-account test removes the user itself.
    await deleteUserByEmail(email);
  },
});

export { expect };
