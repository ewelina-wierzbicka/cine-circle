import { test, expect } from './fixtures/isolatedUser';
import { seedUserMedia } from './fixtures/seed';

// Inception on TMDB. The movie page fetches real TMDB data server-side, same
// as search.spec's detail assertion.
const INCEPTION_ID = 27205;

// Fake TMDB ids for collection-only seeds. They never hit the movie page, so
// the app never needs real TMDB data for these rows.
const ALPHA = { tmdbId: 900001, title: 'Alpha Collection Movie' };
const BETA = { tmdbId: 900002, title: 'Beta Collection Movie' };
const GAMMA = { tmdbId: 900003, title: 'Gamma Collection Movie' };

test.describe('collection', () => {
  test('T6 add movie to "to watch" list', async ({ isolatedUser }) => {
    const { page } = isolatedUser;
    await page.goto(`/movie/${INCEPTION_ID}`);

    await page.getByRole('button', { name: 'I WANT TO WATCH' }).click();

    await expect(
      page.getByText(/saved to your .*to watch.* list/i),
    ).toBeVisible();
    await page.waitForURL(/\/collection\?tab=to_watch/);

    await expect(
      page.getByRole('link', { name: 'Inception' }).first(),
    ).toBeVisible();
  });

  test('T7 add movie to "watched" via entry form', async ({ isolatedUser }) => {
    const { page } = isolatedUser;
    await page.goto(`/movie/${INCEPTION_ID}`);

    await page.getByRole('button', { name: 'I WATCHED' }).click();

    // Pick a date. Today's button is always enabled and uniquely named.
    await page.getByLabel('When did you watch it?').click();
    await page.getByRole('dialog', { name: 'Choose date' }).waitFor();
    await page.getByRole('button', { name: /^Today,/ }).click();

    // 4 stars == value 8, labelled "4 out of 5".
    await page.getByRole('radio', { name: '4 out of 5' }).click();
    await page.getByLabel('Any thoughts?').fill('Mind-bending. A rewatch.');

    await page.getByRole('button', { name: 'SAVE' }).click();

    await expect(
      page.getByText(/saved to your .*watched.* list/i),
    ).toBeVisible();
    await page.waitForURL(/\/collection\?tab=watched/);

    await expect(
      page.getByRole('link', { name: 'Inception' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Rating: 4 out of 5' }),
    ).toBeVisible();
  });

  test('T8a move seeded "to watch" item to watched', async ({
    isolatedUser,
  }) => {
    const { id, page } = isolatedUser;
    await seedUserMedia(id, {
      tmdbId: INCEPTION_ID,
      title: 'Inception',
      watchStatus: 'to_watch',
    });

    await page.goto(`/movie/${INCEPTION_ID}`);

    await page.getByRole('button', { name: 'MOVE TO WATCHED' }).click();

    await page.getByRole('radio', { name: '4 out of 5' }).click();
    await page.getByRole('button', { name: 'UPDATE' }).click();

    await page.waitForURL(/\/collection\?tab=watched/);
    await expect(
      page.getByRole('link', { name: 'Inception' }).first(),
    ).toBeVisible();
  });

  test('T8b delete seeded "to watch" item', async ({ isolatedUser }) => {
    const { id, page } = isolatedUser;
    await seedUserMedia(id, {
      tmdbId: INCEPTION_ID,
      title: 'Inception',
      watchStatus: 'to_watch',
    });

    await page.goto(`/movie/${INCEPTION_ID}`);

    await page.getByRole('button', { name: 'DELETE' }).click();

    await page.waitForURL(/\/collection\?tab=to_watch/);
    await expect(page.getByText('No entries added yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inception' })).toHaveCount(0);
  });

  test('T9 tabs split entries and title filter narrows them', async ({
    isolatedUser,
  }) => {
    const { id, page } = isolatedUser;
    await seedUserMedia(id, { ...ALPHA, watchStatus: 'watched', rating: 8 });
    await seedUserMedia(id, { ...BETA, watchStatus: 'watched', rating: 6 });
    await seedUserMedia(id, { ...GAMMA, watchStatus: 'to_watch' });

    // Watched tab shows both watched entries, not the to_watch one.
    await page.goto('/collection?tab=watched');
    await expect(
      page.getByRole('link', { name: ALPHA.title }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: BETA.title }).first(),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: GAMMA.title })).toHaveCount(0);

    // To Watch tab shows only the to_watch entry.
    await page.goto('/collection?tab=to_watch');
    await expect(
      page.getByRole('link', { name: GAMMA.title }).first(),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: ALPHA.title })).toHaveCount(0);

    // Title filter on the watched tab narrows to the matching entry.
    await page.goto('/collection?tab=watched');
    await page.getByPlaceholder('Filter…').fill('Alpha');
    await expect(
      page.getByRole('link', { name: ALPHA.title }).first(),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: BETA.title })).toHaveCount(0);
  });
});
