import { expect, test } from './fixtures/auth';

// Inception. Rent and buy offers exist in the default region (US), which is
// what the app falls back to when the request carries no geo header.
const INCEPTION_ID = 27205;

test.describe('where to watch', () => {
  test('T22 signed out shows providers without a link', async ({ page }) => {
    await page.goto(`/movie/${INCEPTION_ID}`);

    await expect(
      page.getByRole('heading', { name: /where to watch/i }),
    ).toBeVisible();
    await expect(
      page.getByText('Streaming data provided by JustWatch'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /where to watch/i }),
    ).toHaveCount(0);
  });

  test('T23 signed in links to the TMDB watch page', async ({ authedPage }) => {
    await authedPage.goto(`/movie/${INCEPTION_ID}`);

    const link = authedPage.getByRole('link', {
      name: /where to watch inception/i,
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /themoviedb\.org.*locale=/);
    await expect(link).toHaveAttribute('target', '_blank');
  });
});
