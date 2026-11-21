// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
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

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SITE);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('robots', () => {
  it('disallows exactly the noindex paths', () => {
    expect(disallowRules()).toEqual(DISALLOWED);
  });

  it.each(DISALLOWED)('treats %s as disallowed', (path) => {
    expect(isDisallowed(path)).toBe(true);
  });

  it.each(['/', '/about', '/terms', '/privacy', '/movie/550', '/series/1399'])(
    'leaves the open route %s crawlable',
    (path) => {
      expect(isDisallowed(path)).toBe(false);
    },
  );

  it('allows the root and points at the sitemap', async () => {
    const { default: robots } = await import('@/app/robots');
    const { rules, sitemap } = robots();

    expect(sitemap).toBe(`${SITE}/sitemap.xml`);
    expect(Array.isArray(rules) ? rules : [rules]).toEqual([
      { userAgent: '*', allow: '/', disallow: DISALLOWED },
    ]);
  });
});
