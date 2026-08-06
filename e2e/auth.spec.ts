import { test, expect } from './fixtures/auth';
import { deleteUserByEmail } from './admin';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './env';

// Strong password satisfying: upper, lower, digit, special, 8+ chars.
const STRONG_PASSWORD = 'Str0ng!pass';

test.describe('auth', () => {
  test('T1 login happy path + logout', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_USER_EMAIL);
    await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    await page.waitForURL('/');

    // Menu opens on hover; a click would toggle it back closed.
    await page.getByRole('button', { name: 'User menu' }).hover();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    await page.waitForURL('/login');
    await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible();
  });

  test('T2 login validation', async ({ page }) => {
    await page.goto('/login');
    const signIn = page.getByRole('button', { name: 'SIGN IN' });

    // Empty fields -> required email error.
    await signIn.click();
    await expect(
      page.getByText('Please enter your email address'),
    ).toBeVisible();

    // Bad email format (passes native email check, fails app pattern).
    await page.getByLabel('Email').fill('foo@bar');
    await page.getByLabel('Password').fill('whatever');
    await signIn.click();
    await expect(
      page.getByText('Please enter a valid email address'),
    ).toBeVisible();

    // Wrong credentials -> Supabase error toast.
    await page.getByLabel('Email').fill('nobody@cinecircle.test');
    await page.getByLabel('Password').fill('WrongPass!1');
    await signIn.click();
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('T3 registration validation + confirm-email', async ({ page }) => {
    const newEmail = `reg-${Date.now()}@cinecircle.test`;
    await page.goto('/register');
    const createAccount = page.getByRole('button', { name: 'CREATE ACCOUNT' });

    // Weak password.
    await page.getByLabel('Email').fill(newEmail);
    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Confirm Password').fill('weak');
    await createAccount.click();
    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible();

    // Mismatched confirm.
    await page.getByLabel('Password', { exact: true }).fill(STRONG_PASSWORD);
    await page.getByLabel('Confirm Password').fill('Different!1');
    await createAccount.click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();

    // Valid submit. register() redirects to /confirm-email. If the Supabase
    // project has email confirmation off, signUp returns a session and
    // middleware bounces the now-authed user off /confirm-email to /.
    await page.getByLabel('Confirm Password').fill(STRONG_PASSWORD);
    await createAccount.click();
    await page.waitForURL(
      (url) => url.pathname === '/confirm-email' || url.pathname === '/',
    );
    // No validation error means the account was created.
    await expect(page.getByText('Passwords do not match')).toBeHidden();

    await deleteUserByEmail(newEmail);
  });

  test('T4 auth redirect + rurl', async ({ page }) => {
    // Anonymous access to protected route redirects with rurl.
    await page.goto('/collection');
    await page.waitForURL(/\/login\?rurl=%2Fcollection/);

    await page.getByLabel('Email').fill(TEST_USER_EMAIL);
    await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    await page.waitForURL('/collection');
  });

  test('authedPage fixture reaches protected route', async ({ authedPage }) => {
    await authedPage.goto('/collection');
    await expect(authedPage).toHaveURL('/collection');
  });
});
