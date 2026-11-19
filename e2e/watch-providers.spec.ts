import { expect, test } from './fixtures/auth';

// Inception. Rent and buy offers exist in US, the region the suite pins with
// the `x-vercel-ip-country` header in `playwright.config.ts`. There is no
// default region, so a test that drops that header sees no providers.
const INCEPTION_ID = 27205;

// The Devil's Plan. US streams it on both Netflix (8) and Netflix Standard
// with Ads (1796), which must collapse to one logo.
const DEVILS_PLAN_ID = 214582;

test.describe('where to watch', () => {
  test('T22 signed out links each logo to its provider', async ({ page }) => {
    await page.goto(`/movie/${INCEPTION_ID}`);

    await expect(
      page.getByRole('heading', { name: /where to watch/i }),
    ).toBeVisible();
    await expect(
      page.getByText('Streaming data provided by JustWatch'),
    ).toBeVisible();

    const amazon = page
      .getByRole('list', { name: 'Rent' })
      .getByRole('link', { name: 'Watch Inception on Amazon Video' });
    await expect(amazon).toBeVisible();
    await expect(amazon).toHaveAttribute(
      'href',
      /^https:\/\/www\.primevideo\.com\/search\?phrase=Inception$/,
    );
    await expect(amazon).toHaveAttribute('target', '_blank');

    // Plex has no known URL pattern, so it keeps the TMDB watch page.
    const plex = page.getByRole('link', { name: 'Watch Inception on Plex' });
    await expect(plex).toHaveAttribute('href', /themoviedb\.org.*locale=/);
  });

  test('T24 provider variants of one brand show a single logo', async ({
    authedPage,
  }) => {
    await authedPage.goto(`/series/${DEVILS_PLAN_ID}`);

    const netflix = authedPage.getByRole('link', {
      name: /^Watch .+ on Netflix/,
    });
    await expect(netflix).toHaveCount(1);
    // Wikidata (Q122740095) holds P1874 for this series, so the href is the
    // exact title page, not the Netflix search URL.
    await expect(netflix).toHaveAttribute(
      'href',
      'https://www.netflix.com/title/81653386',
    );
  });

  test.describe('ads-only region', () => {
    // Movie 1396 in PL has only an `ads` offer on TMDB. The section must
    // still render, grouped under "Free with ads".
    test.use({ extraHTTPHeaders: { 'x-vercel-ip-country': 'PL' } });

    test('T25 shows the section when only ads offers exist', async ({
      page,
    }) => {
      await page.goto('/movie/1396');

      await expect(
        page.getByRole('heading', { name: 'Where to watch · PL' }),
      ).toBeVisible();
      await expect(
        page.getByRole('list', { name: 'Free with ads' }),
      ).toBeVisible();
    });
  });

  test.describe('unresolvable region', () => {
    // No geo header, and accept-language is never read, so the region is
    // unknown. Say so rather than showing another country's providers.
    test.use({ extraHTTPHeaders: {}, locale: 'pl-PL' });

    test('T26 says the region is unknown instead of guessing', async ({
      page,
    }) => {
      await page.goto(`/movie/${INCEPTION_ID}`);

      await expect(
        page.getByText(/could not establish your region/i),
      ).toBeVisible();
      await expect(page.getByText(/Where to watch ·/)).toHaveCount(0);
      await expect(
        page.getByText('Streaming data provided by JustWatch'),
      ).toHaveCount(0);
    });
  });
});
