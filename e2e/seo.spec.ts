import { test, expect } from '@playwright/test';
import './env';

// Mirrors `SITE_URL` in src/lib/seo.ts. The e2e tsconfig has no `@/` alias,
// so the constant is re-derived here rather than imported.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

// Paths in the robots.ts disallow list. None may appear in /llms.txt.
const DISALLOWED = [
  '/login',
  '/register',
  '/confirm-email',
  '/forgot-password',
  '/reset-password',
  '/registration-confirmed',
  '/profile',
  '/collection',
];

test.describe('seo', () => {
  test('T20 /llms.txt is served as plain text to anonymous crawlers', async ({
    request,
  }) => {
    // No session and no redirect: `llms.txt` is excluded from the proxy matcher.
    const response = await request.get('/llms.txt', { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');

    const body = await response.text();
    expect(body).toContain('# MidnightFrame');
    expect(body).toContain(`${SITE_URL}/sitemap.xml`);
    expect(body).toContain(`${SITE_URL}/search`);

    for (const path of DISALLOWED) {
      expect(body, `${path} must not be listed in llms.txt`).not.toContain(
        path,
      );
    }
  });
});
