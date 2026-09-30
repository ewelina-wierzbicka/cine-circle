import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

// Serves /manifest.webmanifest, the web app manifest that makes the site
// installable. Same rule as `app/llms.txt/route.ts`: no `cookies()`,
// `headers()` or Supabase here, so it prerenders as static under Cache
// Components. Do not add `export const dynamic`.
//
// `start_url` is `/`, an open route, so a signed-out install lands on a real
// page instead of a login redirect.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE_NAME,
    // The brand name is already short enough for a launcher label, so there is
    // no separate abbreviation to keep in sync.
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // Manifest JSON cannot read CSS vars, so the `bg` token is written out as a
    // literal here and only here.
    background_color: '#0d0d10',
    theme_color: '#0d0d10',
    categories: ['entertainment', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
