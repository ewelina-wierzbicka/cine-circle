// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disallowRules, isDisallowed } from '@/test/robotsRules';

const SITE = 'https://midnightframe.test';

// Every noindex path, asserted as a whole list. `sitemap.ts` and `llms.txt`
// both cross-check against these rules, so a silent removal would widen what
// they are allowed to advertise.
const DISALLOWED = [
  '/api/',
  '/login',
  '/register',
  '/confirm-email',
  '/forgot-password',
  '/reset-password',
  '/registration-confirmed',
  '/profile',
  '/collection',
];

const CONTENT_SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=no';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SITE);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function response() {
  const { GET } = await import('@/app/robots.txt/route');
  return GET();
}

async function body() {
  return (await response()).text();
}

describe('/robots.txt', () => {
  it('serves plain text', async () => {
    expect((await response()).headers.get('content-type')).toBe(
      'text/plain; charset=utf-8',
    );
  });

  it('disallows exactly the noindex paths', async () => {
    expect(await disallowRules()).toEqual(DISALLOWED);
  });

  it.each(DISALLOWED)('treats %s as disallowed', async (path) => {
    expect(await isDisallowed(path)).toBe(true);
  });

  it.each(['/', '/about', '/terms', '/privacy', '/movie/550', '/series/1399'])(
    'leaves the open route %s crawlable',
    async (path) => {
      expect(await isDisallowed(path)).toBe(false);
    },
  );

  it('allows the root and points at the sitemap', async () => {
    const text = await body();

    expect(text).toMatch(/^User-agent: \*$/m);
    expect(text).toMatch(/^Allow: \/$/m);
    expect(text).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  it('declares the content signal inside the wildcard group', async () => {
    const text = await body();
    const lines = text.split('\n');
    const group = lines.indexOf('User-agent: *');
    const signal = lines.indexOf(CONTENT_SIGNAL);
    const blank = lines.indexOf('', group);

    expect(signal).toBeGreaterThan(group);
    expect(signal).toBeLessThan(blank);
  });
});
