import type { NextConfig } from 'next';

// Report-Only for now: it logs violations without blocking, so a missing origin
// cannot break the app. `script-src` still needs 'unsafe-inline' because Next.js
// streams the RSC payload through inline scripts, and a nonce-based policy is
// off the table: a per-request nonce forces every route dynamic and destroys the
// PPR static shell (`cacheComponents: true`).
// Origins: fonts are self-hosted by `next/font/google`, TMDB images are served
// straight from image.tmdb.org by the custom loader, avatars come from Supabase
// storage, and @vercel/analytics loads from the same origin in production but
// from va.vercel-scripts.com in dev and preview.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://image.tmdb.org https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.themoviedb.org https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    imageSizes: [92, 154],
    deviceSizes: [185, 342, 500, 780],
    // Inert while `loader: 'custom'` is set — Next.js 404s /_next/image for any
    // non-default loader, so no image reaches the optimizer. Kept so the config
    // is still correct if the custom loader is ever removed.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'yohsevcruwdfhtwhsuhh.supabase.co',
      },
    ],
  },
};

export default nextConfig;
