import type { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

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
        '/profile',
        '/collection',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
