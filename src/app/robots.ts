import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/login',
        '/register',
        '/confirm-email',
        '/forgot-password',
        '/reset-password',
        '/registration-confirmed',
        '/profile',
        '/collection',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
