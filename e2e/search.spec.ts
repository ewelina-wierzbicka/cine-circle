import { test, expect } from '@playwright/test';
import searchInception from './fixtures/tmdb/search-inception.json';
import movie27205 from './fixtures/tmdb/movie-27205.json';

// These routes cover client-side TMDB traffic: the grid refetch, the filter
// switch, and the detail enrichment in `hooks/useGetMediaDetails.ts`.
// Server-rendered TMDB data (the /search `initialData` seed, the movie page)
// is served by the fixture stub in `e2e/tmdbStub.ts`, so neither layer reaches
// the live API.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/search*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(searchInception),
    }),
  );
  await page.route('**/api/movie*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(movie27205),
    }),
  );
});

test.describe('search', () => {
  test('T5 search Inception, filter movies, open detail', async ({ page }) => {
    await page.goto('/search');

    await page.getByPlaceholder(/Search movies/i).fill('Inception');

    // Results grid renders the matched title.
    const result = page.getByRole('link', { name: 'Inception' }).first();
    await expect(result).toBeVisible();

    // Switch the Movies filter -> results still show.
    await page.getByRole('button', { name: 'Movies' }).first().click();
    await expect(
      page.getByRole('link', { name: 'Inception' }).first(),
    ).toBeVisible();

    // Open the movie detail page.
    await page.getByRole('link', { name: 'Inception' }).first().click();
    await page.waitForURL(/\/movie\/27205/);

    await expect(
      page.getByRole('heading', { name: 'Inception', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('Science Fiction').first()).toBeVisible();
  });
});
