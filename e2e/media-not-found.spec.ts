import { test, expect } from '@playwright/test';

// `/movie/[id]` and `/series/[id]` are PPR routes: the prerendered shell
// flushes a 200 before the page body runs, so `notFound()` inside `MediaPage`
// can only swap the body. `proxy.ts` resolves the id before the response
// starts. These tests pin the status code, not just the rendered UI.
test.describe('media not found', () => {
  test('T20 unknown movie id answers 404', async ({ page }) => {
    const response = await page.goto('/movie/999999999');

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: /scene.*doesn.t exist/i }),
    ).toBeVisible();
  });

  test('T21 unknown series id answers 404', async ({ page }) => {
    const response = await page.goto('/series/999999999');

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: /scene.*doesn.t exist/i }),
    ).toBeVisible();
  });

  test('T22 non-numeric movie id answers 404', async ({ page }) => {
    const response = await page.goto('/movie/abc');

    expect(response?.status()).toBe(404);
  });

  test('T23 valid movie id still answers 200', async ({ page }) => {
    const response = await page.goto('/movie/27205');

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Inception', level: 1 }),
    ).toBeVisible();
  });
});
