import { test, expect, passwordSessionCookies } from './fixtures/auth';
import { admin, deleteUserByEmail, resetPasswordViaRecovery } from './admin';
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
    await page.getByLabel('Email').fill('nobody@midnightframe.test');
    await page.getByLabel('Password').fill('WrongPass!1');
    await signIn.click();
    await expect(page.getByText('Invalid login credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  // Registration is one flow: register -> confirm-email -> the emailed link
  // hits confirm-callback -> registration-confirmed -> sign in. These tests
  // walk that flow in order.
  test.describe('registration flow', () => {
    test('T3 registration validation + confirm-email', async ({ page }) => {
      const newEmail = `reg-${Date.now()}@midnightframe.test`;
      await page.goto('/register');
      const createAccount = page.getByRole('button', {
        name: 'CREATE ACCOUNT',
      });

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

    test('T4 confirm-callback with code lands on registration-confirmed', async ({
      page,
    }) => {
      // The emailed link verifies the email, then redirects here with a code.
      // Any code present -> /registration-confirmed. No session is created.
      await page.goto('/api/auth/confirm-callback?code=any-code');
      await page.waitForURL('/registration-confirmed');
      await expect(page.getByText('all set')).toBeVisible();

      // SIGN IN CTA routes to /login.
      await page.getByRole('button', { name: 'SIGN IN' }).click();
      await page.waitForURL('/login');
      await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible();
    });

    test('T5 confirm-callback with no code redirects to login with toast', async ({
      page,
    }) => {
      // Callback with no code -> /login?error=confirm_failed, surfaced as a toast.
      await page.goto('/api/auth/confirm-callback');
      await page.waitForURL('/login');
      await expect(
        page.getByText('Email confirmation failed. Please try again.'),
      ).toBeVisible();
    });

    test('T6 registration-confirmed redirects a logged-in user home', async ({
      authedPage,
    }) => {
      // It is an auth route; authed users are bounced to /.
      await authedPage.goto('/registration-confirmed');
      await authedPage.waitForURL('/');
    });
  });

  test('T7 auth redirect + rurl', async ({ page }) => {
    // Use a dedicated user so T1's global signOut cannot race with this login.
    const email = `e2e-rurl-${Date.now()}@midnightframe.test`;
    const password = 'E2eRurl!1';
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;

    try {
      // Anonymous access to protected route redirects with rurl.
      await page.goto('/collection');
      await page.waitForURL(/\/login\?rurl=%2Fcollection/);

      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'SIGN IN' }).click();

      await page.waitForURL('/collection');
    } finally {
      await deleteUserByEmail(email);
    }
  });

  test('authedPage fixture reaches protected route', async ({ authedPage }) => {
    await authedPage.goto('/collection');
    await expect(authedPage).toHaveURL('/collection');
  });

  test('T8 forgot-password validation + request sent', async ({ page }) => {
    await page.goto('/forgot-password');
    const send = page.getByRole('button', { name: 'SEND RESET LINK' });

    // Empty -> required error.
    await send.click();
    await expect(
      page.getByText('Please enter your email address'),
    ).toBeVisible();

    // Bad format.
    await page.getByLabel('Email').fill('foo@bar');
    await send.click();
    await expect(
      page.getByText('Please enter a valid email address'),
    ).toBeVisible();

    // Valid submit -> confirmation screen (no email enumeration).
    await page.getByLabel('Email').fill(TEST_USER_EMAIL);
    await send.click();
    await expect(page.getByText('A reset link is on its way.')).toBeVisible();
  });

  test('T9 reset-callback failure redirects to login with toast', async ({
    page,
  }) => {
    // Callback with no code -> /login?error=reset_failed, surfaced as a toast.
    await page.goto('/api/auth/reset-callback');
    await page.waitForURL('/login');
    await expect(
      page.getByText('Password reset failed. Please try again.'),
    ).toBeVisible();
  });

  test('T10 reset-password form validates new password', async ({
    page,
    context,
    isolatedUser,
  }) => {
    // /reset-password expects a session; seed one so the form renders.
    await context.addCookies(
      await passwordSessionCookies(isolatedUser.email, isolatedUser.password),
    );
    await page.goto('/reset-password');
    const submit = page.getByRole('button', { name: 'SET NEW PASSWORD' });

    // Weak password.
    await page.getByLabel('New password').fill('weak');
    await page.getByLabel('Confirm password').fill('weak');
    await submit.click();
    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible();

    // Mismatched confirm.
    await page.getByLabel('New password').fill('Str0ng!pass');
    await page.getByLabel('Confirm password').fill('Different!1');
    await submit.click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('T11 reset-password rejects a non-recovery session', async ({
    page,
    context,
    isolatedUser,
  }) => {
    // A normal logged-in (AMR 'password') user must not be able to reset via
    // /reset-password. Only a recovery-session user may. See CIN-120.
    await context.addCookies(
      await passwordSessionCookies(isolatedUser.email, isolatedUser.password),
    );
    await page.goto('/reset-password');

    await page.getByLabel('New password').fill('Str0ng!pass');
    await page.getByLabel('Confirm password').fill('Str0ng!pass');
    await page.getByRole('button', { name: 'SET NEW PASSWORD' }).click();

    await expect(page.getByText('Reset link expired or invalid')).toBeVisible();
    await expect(page).toHaveURL('/reset-password');
  });

  test('T12 reset happy path: new password logs in, old one fails', async ({
    page,
    context,
    isolatedUser,
  }) => {
    const newPassword = 'N3w!pass99';

    // Complete the reset via a real recovery-token session (same Supabase
    // change the form makes). The emailed PKCE code is unavailable offline, so
    // the form's success click cannot run here; this proves the outcome.
    await resetPasswordViaRecovery(isolatedUser.email, newPassword);

    // The isolatedUser fixture seeded this user's session on the context; clear
    // it so /login renders instead of redirecting an already-authed user.
    await context.clearCookies();
    await page.goto('/login');

    // Old password no longer works.
    await page.getByLabel('Email').fill(isolatedUser.email);
    await page.getByLabel('Password').fill(isolatedUser.password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await expect(page.getByText('Invalid login credentials')).toBeVisible();

    // New password logs in.
    await page.getByLabel('Password').fill(newPassword);
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await page.waitForURL('/');
  });
});
