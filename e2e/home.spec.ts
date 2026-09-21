import { test, expect } from './fixtures/auth';

const ABOUT_HEADING = 'Your film diary, properly kept';

test.describe('home', () => {
  // `authedPage` adds session cookies to the default context, so the signed-out
  // half needs its own context rather than the default `page` fixture.
  test('T19 "What is MidnightFrame" shows signed-out, hidden signed-in', async ({
    browser,
    authedPage,
  }) => {
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();

    // Signed out: the marketing section renders, so crawlers still see the copy.
    await anonPage.goto('/');
    await expect(
      anonPage.getByRole('heading', { name: ABOUT_HEADING, level: 2 }),
    ).toBeVisible();
    await expect(anonPage.getByText('What is MidnightFrame')).toBeVisible();
    await anonContext.close();

    // Signed in: the hero h1 stays, the section is gone.
    await authedPage.goto('/');
    await expect(authedPage.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: ABOUT_HEADING, level: 2 }),
    ).toHaveCount(0);
    await expect(authedPage.getByText('What is MidnightFrame')).toHaveCount(0);
  });
});
