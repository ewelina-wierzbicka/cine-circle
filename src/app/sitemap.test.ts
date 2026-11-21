import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toHref } from '@/lib/mediaUtils';
import { isDisallowed } from '@/test/robotsRules';
import type { PopularMedia } from '@/types';

const SITE = 'https://midnightframe.test';

// What the real getPopularMediaEntries returns: already deduped by
// `${mediaType}-${id}`, so the same TMDB id under two media types stays.
const ENTRIES: PopularMedia[] = [
  { id: 550, title: 'Fight Club', mediaType: 'movie' },
  { id: 1399, title: 'Game of Thrones', mediaType: 'series' },
  { id: 1399, title: 'Same id, other type', mediaType: 'movie' },
  { id: 123, title: '!!!', mediaType: 'movie' },
  { id: 10, title: 'Amélie: Le Fabuleux Destin', mediaType: 'movie' },
];

vi.mock('@/services/getStaticMediaParams', () => ({
  getPopularMediaEntries: vi.fn(async () => ENTRIES),
}));

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SITE);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function sitemapUrls() {
  const { default: sitemap } = await import('@/app/sitemap');
  return (await sitemap()).map((entry) => new URL(entry.url));
}

describe('sitemap', () => {
  it('lists no path that robots.ts disallows', async () => {
    for (const url of await sitemapUrls()) {
      expect(isDisallowed(url.pathname), url.pathname).toBe(false);
    }
  });

  it('lists every URL on SITE_URL', async () => {
    for (const url of await sitemapUrls()) {
      expect(url.origin).toBe(SITE);
    }
  });

  it('lists each media entry once, keyed by media type and id', async () => {
    const urls = (await sitemapUrls()).map(String);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(`${SITE}/movie/1399-same-id-other-type`);
    expect(urls).toContain(`${SITE}/series/1399-game-of-thrones`);
  });

  // A non-canonical slug would 308 from proxy.ts, and a redirecting sitemap
  // URL wastes crawl budget.
  it('uses the canonical toHref slug for every media URL', async () => {
    const mediaPaths = (await sitemapUrls())
      .map((url) => url.pathname)
      .filter((path) => /^\/(movie|series)\//.test(path));

    expect(mediaPaths).toEqual(
      ENTRIES.map((e) => toHref(e.id, e.title, e.mediaType)),
    );
  });
});
