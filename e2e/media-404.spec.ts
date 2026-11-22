import { test, expect } from '@playwright/test';

// A soft 404 lets crawlers index an empty page, so the status is the assertion
// here, not the UI. `proxy.ts` resolves the id before the PPR shell flushes.
test.describe('unknown media ids', () => {
  test('T27 unknown movie id answers 404 and noindex', async ({ page }) => {
    const response = await page.goto('/movie/999999999');

    expect(response?.status()).toBe(404);
    expect(response?.headers()['x-robots-tag']).toBe('noindex');
    await expect(page.getByText('Error 404')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /doesn’t exist/i, level: 1 }),
    ).toBeVisible();
  });

  test('T28 non-numeric movie slug answers 404', async ({ page }) => {
    const response = await page.goto('/movie/abc');

    expect(response?.status()).toBe(404);
    expect(response?.headers()['x-robots-tag']).toBe('noindex');
  });

  test('T29 unknown series id answers 404', async ({ page }) => {
    const response = await page.goto('/series/999999999');

    expect(response?.status()).toBe(404);
    expect(response?.headers()['x-robots-tag']).toBe('noindex');
  });

  test('T30 a known id still answers 200', async ({ page }) => {
    const response = await page.goto('/movie/27205');

    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-robots-tag']).toBeUndefined();
  });
});
