import { test, expect } from './fixtures/auth';

// Movie 27205 is Inception — already warmed in global-setup and used in search.spec.ts.
const MOVIE_URL = '/movie/27205-inception';

test.describe('media detail', () => {
  test('T20 signed-out visitor sees no back-to-collection link', async ({
    browser,
  }) => {
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();

    await anonPage.goto(MOVIE_URL);
    await expect(
      anonPage.getByRole('heading', { name: 'Inception', level: 1 }),
    ).toBeVisible();

    // Collection link is a dead end for signed-out users — must not render.
    await expect(
      anonPage.getByRole('link', { name: /back to collection/i }),
    ).toHaveCount(0);

    // Sign-in prompt should appear instead.
    await expect(
      anonPage.getByText(/sign in to add to collection/i),
    ).toBeVisible();

    await anonContext.close();
  });

  test('T21 signed-in user sees back-to-collection link', async ({
    authedPage,
  }) => {
    await authedPage.goto(MOVIE_URL);
    await expect(
      authedPage.getByRole('heading', { name: 'Inception', level: 1 }),
    ).toBeVisible();

    await expect(
      authedPage.getByRole('link', { name: /back to collection/i }),
    ).toBeVisible();
  });
});
