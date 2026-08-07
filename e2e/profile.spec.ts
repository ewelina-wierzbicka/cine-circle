import { test, expect } from './fixtures/auth';

test.describe('profile', () => {
  test('T10 update display name persists after reload', async ({
    authedPage: page,
  }) => {
    const newName = `QA Name ${Date.now()}`;

    await page.goto('/profile');

    // Fresh persistent user has no display name yet -> "Set name".
    await page.getByRole('button', { name: 'Set name' }).click();
    await page.getByRole('textbox').fill(newName);
    await page.getByRole('button', { name: 'Save' }).click();

    // Name button now reflects the saved value.
    await expect(page.getByRole('button', { name: newName })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: newName })).toBeVisible();
  });

  test('T11 delete account redirects and blocks re-login', async ({
    page,
    isolatedUser,
  }) => {
    // Log in as the throwaway user via the UI.
    await page.goto('/login');
    await page.getByLabel('Email').fill(isolatedUser.email);
    await page.getByLabel('Password').fill(isolatedUser.password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await page.waitForURL('/');

    await page.goto('/profile');

    await page.getByRole('button', { name: /Delete account/ }).click();
    await page.getByPlaceholder('DELETE').fill('DELETE');
    await page.getByRole('button', { name: 'Delete my account' }).click();

    // Deletion redirects to /login.
    await page.waitForURL('/login');

    // Same credentials no longer authenticate.
    await page.getByLabel('Email').fill(isolatedUser.email);
    await page.getByLabel('Password').fill(isolatedUser.password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
