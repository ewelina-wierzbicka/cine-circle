import type { MetadataRoute } from 'next';
import { getPopularMediaEntries } from '@/services/getStaticMediaParams';
import { toHref } from '@/lib/mediaUtils';
import { SITE_URL as baseUrl, STATIC_PAGE_LAST_MODIFIED } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const media = await getPopularMediaEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: STATIC_PAGE_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1.0,
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

  // No `lastModified` here. We have no record of when a media page's content
  // last changed
  const mediaRoutes: MetadataRoute.Sitemap = media.map((item) => ({
    url: `${baseUrl}${toHref(item.id, item.title, item.mediaType)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...mediaRoutes];
}
