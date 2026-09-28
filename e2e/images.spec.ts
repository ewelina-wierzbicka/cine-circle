import { test, expect, type Page } from '@playwright/test';
import nextConfig from '../next.config';

// Guards the custom image loader (src/lib/imageLoader.ts). Every poster,
// avatar and logo used to pass through /_next/image, which burned the whole
// free-tier Image Optimization quota. Images now go straight to TMDB and
// /_next/image is a dead route. These tests fail if that ever regresses.

// The only TMDB width buckets the loader is allowed to emit.
const TMDB_BUCKETS = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780'];
const MAX_TMDB_WIDTH = 780;

const TMDB_SIZE = /^https:\/\/image\.tmdb\.org\/t\/p\/([^/]+)\//;

// Every URL an <img> can point the browser at: `src` plus each srcset candidate.
async function imageUrls(page: Page): Promise<string[]> {
  return page.$$eval('img', (imgs) =>
    imgs
      .flatMap((img) => [
        img.getAttribute('src') ?? '',
        ...(img.getAttribute('srcset') ?? '')
          .split(',')
          .map((candidate) => candidate.trim().split(/\s+/)[0] ?? ''),
      ])
      .filter(Boolean),
  );
}

function tmdbSizes(urls: string[]): string[] {
  return urls
    .map((url) => TMDB_SIZE.exec(url)?.[1])
    .filter((size): size is string => !!size);
}

test.describe('images', () => {
  test('T20 home page never routes images through /_next/image', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Covers the header logo, which is a local asset and the first thing a
    // default loader would send to the optimizer.
    expect(await page.content()).not.toContain('/_next/image');

    const urls = await imageUrls(page);
    expect(urls.filter((url) => url.includes('/_next/image'))).toEqual([]);
    for (const size of tmdbSizes(urls)) {
      expect(TMDB_BUCKETS).toContain(size);
    }
  });

  test('T21 search results serve TMDB posters from allowed width buckets', async ({
    page,
  }) => {
    await page.goto('/search?query=matrix');

    const poster = page.locator('img[src*="image.tmdb.org"]').first();
    await expect(poster).toBeVisible();

    expect(await page.content()).not.toContain('/_next/image');

    const urls = await imageUrls(page);
    expect(urls.filter((url) => url.includes('/_next/image'))).toEqual([]);

    // Non-vacuous: the page really did render TMDB images to check.
    const sizes = tmdbSizes(urls);
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(TMDB_BUCKETS).toContain(size);
    }
    expect(sizes).not.toContain('original');
  });

  test('T22 next.config keeps the custom loader and TMDB-sized widths', async () => {
    const images = nextConfig.images;

    expect(images?.loader).toBe('custom');
    expect(images?.loaderFile).toBe('./src/lib/imageLoader.ts');

    // Widening these past 780 makes next/image emit candidates that the loader
    // can only satisfy with TMDB `original`, a multi-megabyte file.
    const widths = [
      ...(images?.imageSizes ?? []),
      ...(images?.deviceSizes ?? []),
    ];
    expect(widths.length).toBeGreaterThan(0);
    for (const width of widths) {
      expect(width).toBeLessThanOrEqual(MAX_TMDB_WIDTH);
      expect(TMDB_BUCKETS).toContain(`w${width}`);
    }
  });

  test('T23 /_next/image optimizer route is not served', async ({
    request,
  }) => {
    const response = await request.get(
      '/_next/image?url=%2Flogo.webp&w=640&q=75',
    );

    expect(response.ok()).toBe(false);
    expect(response.status()).toBe(404);
  });
});
