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

  test('T12 invalid new email shows error and does not change email', async ({
    isolatedUser,
  }) => {
    // Throwaway user so a rejected email change never touches shared users.
    const { page, email } = isolatedUser;

    await page.goto('/profile');

    // Expand the email row.
    await page.getByRole('button', { name: /Email address/ }).click();

    // Malformed address -> Supabase rejects before any email is sent.
    await page.getByRole('textbox').fill('notanemail');
    await page.getByRole('button', { name: 'Update email' }).click();

    // Inline validation error appears; panel stays open.
    await expect(
      page.getByText(/unable to validate email address|invalid/i),
    ).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();

    // Original address is still shown — nothing changed.
    await expect(page.getByText(email)).toBeVisible();
  });

  test('T13 valid new email is accepted and awaits confirmation', async ({
    isolatedUser,
  }) => {
    // Throwaway user so the pending change never affects shared users.
    const { page, email } = isolatedUser;
    const requestedEmail = `e2e-changed-${Date.now()}@midnightframe.test`;

    await page.goto('/profile');

    await page.getByRole('button', { name: /Email address/ }).click();
    const field = page.getByRole('textbox');
    await field.fill(requestedEmail);
    await page.getByRole('button', { name: 'Update email' }).click();

    // Shared project email limits can reject the request; skip if so.
    const rateError = page.getByText(/rate limit|too many|for security/i);
    await expect(async () => {
      const settled = (await field.isHidden()) || (await rateError.isVisible());
      expect(settled).toBeTruthy();
    }).toPass();
    if (await rateError.isVisible()) {
      test.skip(true, 'Email rate limit hit on shared project');
    }

    // Success closes the panel: the new-email field is gone.
    await expect(field).toBeHidden();

    // Email only changes after the link is confirmed, so it is unchanged now.
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(requestedEmail)).toBeHidden();
  });

  test('T11 delete account redirects and blocks re-login', async ({
    isolatedUser,
  }) => {
    // Throwaway user is already authed on its own page.
    const { page } = isolatedUser;

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
