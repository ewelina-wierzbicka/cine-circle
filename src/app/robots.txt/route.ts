import { SITE_URL } from '@/lib/seo';

const DISALLOW = [
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

const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no';

const body = `User-agent: *
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
${DISALLOW.map((path) => `Disallow: ${path}`).join('\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET() {
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
