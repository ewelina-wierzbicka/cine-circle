import type { MetadataRoute } from 'next';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getPopularMovies, getPopularSeries } from '@/services/getPopularMedia';
import { toHref } from '@/lib/mediaUtils';
import { SITE_URL as baseUrl, STATIC_PAGE_LAST_MODIFIED } from '@/lib/seo';
import { PopularMedia } from '@/types';

// Two TMDB pages per media type is 20 entries each, so trending plus popular
// lands around 85 media URLs. Only open routes belong here — `/search`,
// `/collection`, `/profile` and the auth routes are in the robots disallow list.
const POPULAR_PAGES = [1, 2];

const STATIC_LAST_MODIFIED_MS = new Date(STATIC_PAGE_LAST_MODIFIED).getTime();

// TMDB's popular lists include unreleased titles, and crawlers ignore a
// `lastmod` in the future. The cap is the hand-bumped constant rather than
// `Date.now()` on purpose: reading the clock here would mark /sitemap.xml
// dynamic under Cache Components, and it can stay a prerendered static file.
function toLastModified(date: string | undefined): string {
  if (!date) return STATIC_PAGE_LAST_MODIFIED;
  const parsed = new Date(date).getTime();
  if (Number.isNaN(parsed) || parsed > STATIC_LAST_MODIFIED_MS) {
    return STATIC_PAGE_LAST_MODIFIED;
  }
  return new Date(parsed).toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [trending, popularPages] = await Promise.all([
    getTrendingMovies(),
    Promise.all([
      ...POPULAR_PAGES.map((page) => getPopularMovies(page)),
      ...POPULAR_PAGES.map((page) => getPopularSeries(page)),
    ]),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: STATIC_PAGE_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: STATIC_PAGE_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: STATIC_PAGE_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const media: PopularMedia[] = [
    ...trending.map((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.type,
      releaseDate: item.release_date,
    })),
    ...popularPages.flat(),
  ];

  // Trending and popular overlap heavily, and a duplicate URL wastes crawl
  // budget. First entry wins: trending is the higher-priority source.
  const byKey = new Map<string, PopularMedia>();
  for (const item of media) {
    const key = `${item.mediaType}-${item.id}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }

  const mediaRoutes: MetadataRoute.Sitemap = [...byKey.values()].map(
    (item) => ({
      // Must match the page's `alternates.canonical` exactly, which is built
      // from the same `toHref` call.
      url: `${baseUrl}${toHref(item.id, item.title, item.mediaType)}`,
      lastModified: toLastModified(item.releaseDate),
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...mediaRoutes];
}
