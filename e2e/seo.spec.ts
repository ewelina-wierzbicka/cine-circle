import { test, expect, Page } from '@playwright/test';

// Crawlers read the raw HTML, so every block must be parseable JSON-LD.
async function readJsonLd(page: Page): Promise<unknown[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocks.map((block) => JSON.parse(block) as unknown);
}

function typesOf(nodes: unknown[]): string[] {
  return nodes.map((node) => (node as { '@type'?: string })['@type'] ?? '');
}

test.describe('structured data', () => {
  test('T20 home page ships one site @graph', async ({ page }) => {
    await page.goto('/');

    const blocks = await readJsonLd(page);
    expect(blocks).toHaveLength(1);

    const graph = blocks[0] as {
      '@context': string;
      '@graph': unknown[];
    };
    expect(graph['@context']).toBe('https://schema.org');
    expect(typesOf(graph['@graph'])).toEqual([
      'Organization',
      'WebSite',
      'WebApplication',
    ]);
  });

  test('T21 movie page ships Movie and BreadcrumbList', async ({ page }) => {
    await page.goto('/movie/27205-inception');

    const blocks = await readJsonLd(page);
    expect(typesOf(blocks)).toEqual(['Movie', 'BreadcrumbList']);

    const movie = blocks[0] as Record<string, unknown>;
    expect(movie.name).toBe('Inception');
    expect(movie.url).toContain('/movie/27205-inception');
    // Borrowed TMDB vote data must never be emitted as our own rating.
    expect(movie).not.toHaveProperty('aggregateRating');

    const breadcrumb = blocks[1] as {
      itemListElement: { position: number; name: string }[];
    };
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0].name).toBe('Home');
    expect(breadcrumb.itemListElement[1].name).toBe('Inception');
  });

  test('T22 noindex pages ship no JSON-LD', async ({ page }) => {
    await page.goto('/search?query=inception');

    expect(await readJsonLd(page)).toHaveLength(0);
  });
});
