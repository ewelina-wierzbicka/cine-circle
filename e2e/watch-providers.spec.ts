import { expect, test } from './fixtures/auth';

// Inception. Rent and buy offers exist in the default region (US), which is
// what the app falls back to when the request carries no geo header.
const INCEPTION_ID = 27205;

// The Devil's Plan. US streams it on both Netflix (8) and Netflix Standard
// with Ads (1796), which must collapse to one logo.
const DEVILS_PLAN_ID = 214582;

test.describe('where to watch', () => {
  test('T22 signed out shows providers without a link', async ({ page }) => {
    await page.goto(`/movie/${INCEPTION_ID}`);

    await expect(
      page.getByRole('heading', { name: /where to watch/i }),
    ).toBeVisible();
    await expect(
      page.getByText('Streaming data provided by JustWatch'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /^Watch .+ on / })).toHaveCount(
      0,
    );
  });

  test('T23 signed in links each logo to its provider', async ({
    authedPage,
  }) => {
    await authedPage.goto(`/movie/${INCEPTION_ID}`);

    // Amazon Video is in both Rent and Buy, so scope to one group.
    const amazon = authedPage
      .getByRole('list', { name: 'Rent' })
      .getByRole('link', { name: 'Watch Inception on Amazon Video' });
    await expect(amazon).toBeVisible();
    await expect(amazon).toHaveAttribute(
      'href',
      /^https:\/\/www\.primevideo\.com\/search\?phrase=Inception$/,
    );
    await expect(amazon).toHaveAttribute('target', '_blank');

    // Plex has no known URL pattern, so it keeps the TMDB watch page.
    const plex = authedPage.getByRole('link', {
      name: 'Watch Inception on Plex',
    });
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
    test.use({ locale: 'pl-PL' });

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
});
