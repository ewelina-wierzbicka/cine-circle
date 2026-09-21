import type { MetadataRoute } from 'next';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { toHref } from '@/lib/mediaUtils';
import { SITE_URL as baseUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trendingMovies = await getTrendingMovies();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const movieRoutes: MetadataRoute.Sitemap = trendingMovies.map((movie) => ({
    url: `${baseUrl}${toHref(movie.id, movie.title, movie.type)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [...staticRoutes, ...movieRoutes];
}
