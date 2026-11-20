import { test, expect } from './fixtures/auth';

const TMDB_ATTRIBUTION =
  /not endorsed, certified, or otherwise approved by TMDB/;

test.describe('home', () => {
  test('T27 TMDB attribution shows signed in and signed out', async ({
    browser,
    authedPage,
  }) => {
    await authedPage.goto('/');
    await expect(authedPage.getByText(TMDB_ATTRIBUTION)).toBeVisible();

    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    await anonPage.goto('/login');
    await expect(anonPage.getByText(TMDB_ATTRIBUTION)).toBeVisible();
    await anonContext.close();
  });
});
