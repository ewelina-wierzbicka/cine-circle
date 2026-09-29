import type { MetadataRoute } from 'next';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getPopularMovies, getPopularSeries } from '@/services/getPopularMedia';
import { toHref } from '@/lib/mediaUtils';
import { SITE_URL as baseUrl, STATIC_PAGE_LAST_MODIFIED } from '@/lib/seo';
import { PopularMedia } from '@/types';

const POPULAR_PAGES = [1, 2];

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
      url: `${baseUrl}/browse`,
      lastModified: STATIC_PAGE_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: STATIC_PAGE_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.4,
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

  // No `lastModified` here. We have no record of when a media page's content
  // last changed
  const mediaRoutes: MetadataRoute.Sitemap = [...byKey.values()].map(
    (item) => ({
      url: `${baseUrl}${toHref(item.id, item.title, item.mediaType)}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...mediaRoutes];
}
