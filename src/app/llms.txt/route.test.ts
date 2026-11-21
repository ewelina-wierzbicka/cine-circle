import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isDisallowed } from '@/test/robotsRules';

// A domain nobody would hardcode: if the body names any other origin, it was
// typed in rather than built from SITE_URL.
const SENTINEL = 'https://sentinel-site.test';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SENTINEL);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function body() {
  const { GET } = await import('@/app/llms.txt/route');
  return GET().text();
}

const linkedUrls = (text: string) =>
  [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => new URL(m[1]));

describe('/llms.txt', () => {
  it('lists no page that robots.ts disallows', async () => {
    const urls = linkedUrls(await body());
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(isDisallowed(url.pathname), url.pathname).toBe(false);
    }
  });

  it('builds every URL from SITE_URL, with no hardcoded domain', async () => {
    const text = await body();
    const origins = [...text.matchAll(/https?:\/\/[^\s)`'"]+/g)].map(
      (m) => new URL(m[0]).origin,
    );

    expect(origins.length).toBeGreaterThan(0);
    expect(new Set(origins)).toEqual(new Set([SENTINEL]));
  });
});
