import { test as base, expect, mergeTests, type Page } from '@playwright/test';
import { test as isolatedTest } from './isolatedUser';
import { sessionCookiesFor } from './session';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../env';

// Shared persistent user, authed via captured cookies. Non-mutating tests use
// this. Mutating and destructive tests use `isolatedUser` (see isolatedUser.ts).
const authedTest = base.extend<{ authedPage: Page }>({
  authedPage: async ({ context }, use) => {
    await context.addCookies(
      await sessionCookiesFor(TEST_USER_EMAIL, TEST_USER_PASSWORD),
    );
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture callback, not a React hook
    await use(page);
  },
});

// One import gives specs both `authedPage` and `isolatedUser`.
export const test = mergeTests(authedTest, isolatedTest);
export { expect };
export type { IsolatedUser } from './isolatedUser';
