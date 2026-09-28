import { test, expect } from './fixtures/auth';

const ABOUT_HEADING = "Every movie you've watched. Every one you haven't.";
const ABOUT_EYEBROW = 'For people who care what they watch';

test.describe('home', () => {
  test('T19 about section shows signed-out, hidden signed-in', async ({
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
    await expect(anonPage.getByText(ABOUT_EYEBROW)).toBeVisible();
    await anonContext.close();

    // Signed in: the hero h1 stays, the section is gone.
    await authedPage.goto('/');
    await expect(authedPage.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: ABOUT_HEADING, level: 2 }),
    ).toHaveCount(0);
    await expect(authedPage.getByText(ABOUT_EYEBROW)).toHaveCount(0);
  });
});
