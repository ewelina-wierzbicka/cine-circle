import { expect, test } from '@playwright/test';

// The detail page used to ship the whole TMDB block twice: once in the
// Suspense fallback, once in the streamed user-enriched tree. A crawler saw
// two <h1>s and two copies of the overview on ~80 sitemap URLs.
test.describe('seo', () => {
  test('T20 movie page renders exactly one h1', async ({ page }) => {
    await page.goto('/movie/27205-inception');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Inception' }),
    ).toBeVisible();
  });

  test('T21 series page renders exactly one h1', async ({ page }) => {
    await page.goto('/series/1399-game-of-thrones');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('T22 movie overview text appears once', async ({ page }) => {
    await page.goto('/movie/27205-inception');

    const overview = page.getByText(
      /Cobb, a skilled thief who commits corporate espionage/i,
    );
    await expect(overview).toHaveCount(1);
  });
});
