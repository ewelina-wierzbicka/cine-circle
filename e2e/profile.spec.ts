import { test, expect } from './fixtures/auth';
import { admin } from './admin';
import { SUPABASE_URL } from './env';
import { makeNoisePng } from './fixtures/png';

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

  test('T14 avatar upload updates avatar and stores resized image', async ({
    isolatedUser,
  }) => {
    const { page, id: userId } = isolatedUser;

    // 500x500 noise PNG ≈ 750 KB — under the 1 MB limit but far larger
    // than a resized 128px WebP, so the resize is provable by size.
    const source = makeNoisePng(500);

    await page.goto('/profile');

    // WebP encode support decides whether resizeImage downscales or passes
    // the original through (per-project capability, checked at runtime).
    const canEncodeWebp = await page.evaluate(() =>
      document
        .createElement('canvas')
        .toDataURL('image/webp')
        .startsWith('data:image/webp'),
    );

    // Drive the real flow: the pencil button opens the file chooser.
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Change avatar' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: source,
    });

    // Initials swap to a rendered <img> once the signed URL comes back.
    // exact: the header renders its own "User avatar" img after upload.
    const avatar = page.getByRole('img', { name: 'Avatar', exact: true });
    await expect(avatar).toBeVisible();

    const src = await avatar.getAttribute('src');
    expect(src).toBeTruthy();

    // Signed URL must point at the user's object in the avatar bucket.
    const marker = '/object/sign/avatar/';
    const pathname = new URL(src!, SUPABASE_URL).pathname;
    expect(pathname).toContain(marker);
    const storedPath = decodeURIComponent(
      pathname.slice(pathname.indexOf(marker) + marker.length),
    );
    expect(storedPath.startsWith(`${userId}/avatar.`)).toBeTruthy();

    const { data: object, error } = await admin.storage
      .from('avatar')
      .download(storedPath);
    expect(error).toBeNull();
    if (!object) throw new Error('Avatar object missing from storage');

    if (canEncodeWebp) {
      expect(storedPath.endsWith('.webp')).toBeTruthy();
      // Materially smaller than the source proves the resize ran.
      expect(object.size).toBeLessThan(source.length / 2);
    } else {
      // Fallback path: resizeImage returned the original untouched.
      expect(storedPath.endsWith('.png')).toBeTruthy();
      expect(object.size).toBe(source.length);
    }

    // Keep local storage tidy; user deletion does not cascade to objects.
    await admin.storage.from('avatar').remove([storedPath]);
  });

  test('T15 avatar over 1 MB is rejected with inline error', async ({
    isolatedUser,
  }) => {
    const { page } = isolatedUser;

    await page.goto('/profile');

    // Size is validated before decoding, so the payload need not be a
    // real image.
    const oversize = Buffer.alloc(1024 * 1024 + 1);
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Change avatar' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'big.png',
      mimeType: 'image/png',
      buffer: oversize,
    });

    await expect(page.getByText('Image must be under 1 MB.')).toBeVisible();

    // No upload happened: the avatar img never appears.
    await expect(
      page.getByRole('img', { name: 'Avatar', exact: true }),
    ).toHaveCount(0);
  });

  test('T16 avatar with disallowed type is rejected with inline error', async ({
    isolatedUser,
  }) => {
    const { page } = isolatedUser;

    await page.goto('/profile');

    // Type is validated before decoding, so the payload need not be an image.
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Change avatar' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    });

    await expect(
      page.getByText('Only JPEG, PNG, WebP, and GIF images are allowed.'),
    ).toBeVisible();

    // No upload happened: the avatar img never appears.
    await expect(
      page.getByRole('img', { name: 'Avatar', exact: true }),
    ).toHaveCount(0);
  });

  test('T17 stored avatar is WebP capped at 128px with aspect preserved', async ({
    isolatedUser,
  }) => {
    const { page } = isolatedUser;

    await page.goto('/profile');

    const canEncodeWebp = await page.evaluate(() =>
      document
        .createElement('canvas')
        .toDataURL('image/webp')
        .startsWith('data:image/webp'),
    );
    test.skip(!canEncodeWebp, 'Browser cannot encode WebP; resize is bypassed');

    // Non-square source: proves the long edge is capped and the ratio kept.
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Change avatar' }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: makeNoisePng(400, 300),
    });

    const avatar = page.getByRole('img', { name: 'Avatar', exact: true });
    await expect(avatar).toBeVisible();
    const src = await avatar.getAttribute('src');
    expect(src).toBeTruthy();

    // Decode in the browser: Node has no createImageBitmap, and this also
    // proves the signed URL serves a real, decodable image.
    const stored = await page.evaluate(async (url: string) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return {
        contentType: res.headers.get('content-type'),
        blobType: blob.type,
        ...dims,
      };
    }, src!);

    expect(stored.contentType).toContain('image/webp');
    expect(stored.blobType).toBe('image/webp');

    // 400x300 scaled to a 128px box -> 128x96.
    expect(stored.width).toBe(128);
    expect(stored.height).toBe(96);

    // Keep local storage tidy; user deletion does not cascade to objects.
    const marker = '/object/sign/avatar/';
    const pathname = new URL(src!, SUPABASE_URL).pathname;
    const storedPath = decodeURIComponent(
      pathname.slice(pathname.indexOf(marker) + marker.length),
    );
    await admin.storage.from('avatar').remove([storedPath]);
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
