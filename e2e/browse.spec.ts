import { test, expect } from '@playwright/test';

// /browse is an open route: crawlers and signed-out visitors must get it
// without a redirect to /login.
test.describe('browse', () => {
  test('T20 browse hub lists media links and opens a detail page', async ({
    page,
  }) => {
    await page.goto('/browse');

    await expect(page).toHaveURL(/\/browse$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    for (const heading of [
      'Trending this week',
      'Popular movies',
      'Popular series',
    ]) {
      await expect(
        page.getByRole('heading', { name: heading, level: 2 }),
      ).toBeVisible();
    }

    const mediaLink = page
      .locator('ul a[href^="/movie/"], ul a[href^="/series/"]')
      .first();
    await expect(mediaLink).toBeVisible();

    const href = await mediaLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Hrefs come from `toHref`, the same call the detail pages canonicalise
    // with, so the click must land on that exact URL with no redirect.
    await mediaLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('T21 signed-out header and footer link to /browse', async ({ page }) => {
    await page.goto('/');

    // The footer renders for signed-out visitors on every (app) route.
    const footerLink = page
      .getByRole('navigation', { name: 'Footer' })
      .getByRole('link', { name: 'Browse' });
    await expect(footerLink).toBeVisible();

    const headerLink = page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Browse' });
    await expect(headerLink).toBeVisible();

    await headerLink.click();
    await expect(page).toHaveURL(/\/browse$/);
    await expect(
      page.getByRole('heading', { name: 'Browse movies and series', level: 1 }),
    ).toBeVisible();
  });
});
