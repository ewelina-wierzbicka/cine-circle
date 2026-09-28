import { test, expect } from './fixtures/auth';

const ABOUT_HEADING = "Every movie you've watched. Every one you haven't.";
const ABOUT_EYEBROW = 'For people who care what they watch';
const DEFINITION = 'MidnightFrame is a free, private movie and TV tracker.';
const FAQ_HEADING = 'Common questions';
const FAQ_QUESTIONS = [
  'Is MidnightFrame free?',
  'Is my collection private?',
  'Where does the movie and series data come from?',
  'How does it compare with Letterboxd?',
];

test.describe('home', () => {
  test('T19 about section shows signed-out, hidden signed-in', async ({
    browser,
    authedPage,
  }) => {
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();

    // Signed out: the marketing section renders, so crawlers still see the copy.
    await anonPage.goto('/');
    await expect(
      anonPage.getByRole('heading', { name: ABOUT_HEADING, level: 2 }),
    ).toBeVisible();
    await expect(anonPage.getByText(ABOUT_EYEBROW)).toBeVisible();

    // The definition names the brand and says free and private.
    await expect(
      anonPage.getByText(DEFINITION, { exact: false }),
    ).toBeVisible();

    // The FAQ answers the four questions search engines and visitors ask.
    await expect(
      anonPage.getByRole('heading', { name: FAQ_HEADING, level: 2 }),
    ).toBeVisible();
    for (const question of FAQ_QUESTIONS) {
      await expect(
        anonPage.getByRole('heading', { name: question, level: 3 }),
      ).toBeVisible();
    }

    // The h1 reads as one sentence; the <br /> must not glue "you" to "watch".
    await expect(
      anonPage.getByRole('heading', { level: 1 }),
    ).toHaveAccessibleName('What will you watch next?');

    await anonContext.close();

    // Signed in: the hero h1 stays, the section is gone.
    await authedPage.goto('/');
    await expect(authedPage.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: ABOUT_HEADING, level: 2 }),
    ).toHaveCount(0);
    await expect(authedPage.getByText(ABOUT_EYEBROW)).toHaveCount(0);
    await expect(
      authedPage.getByText(DEFINITION, { exact: false }),
    ).toHaveCount(0);
    await expect(
      authedPage.getByRole('heading', { name: FAQ_HEADING, level: 2 }),
    ).toHaveCount(0);
    for (const question of FAQ_QUESTIONS) {
      await expect(
        authedPage.getByRole('heading', { name: question, level: 3 }),
      ).toHaveCount(0);
    }
  });
});
