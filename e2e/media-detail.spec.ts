import { expect, test } from '@playwright/test';

// `?from=search` and `?step=2` used to be read from `searchParams` at the page
// root, which kept the media routes out of the prerender. They are read in
// client components behind their own Suspense boundaries now, so these two
// tests guard the behaviour the move could silently drop.
test.describe('media detail search params', () => {
  test('T23 ?from=search swaps the back link to the search destination', async ({
    page,
  }) => {
    await page.goto('/movie/27205-inception?from=search');

    const back = page.getByRole('link', { name: /BACK TO SEARCH/ });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href', '/');

    await page.goto('/movie/27205-inception');
    await expect(
      page.getByRole('link', { name: /BACK TO COLLECTION/ }),
    ).toHaveAttribute('href', '/collection');
  });

  test('T24 ?step=2 deep link opens the entry form', async ({ page }) => {
    await page.goto('/movie/27205-inception?step=2');

    await expect(page.getByText(/WHEN DID YOU WATCH IT\?/i)).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Inception' }),
    ).toHaveCount(0);
  });
});
