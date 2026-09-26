import type { NextConfig } from 'next';

// The list below says which servers the browser may load things from.
//
// It is sent as Report-Only, so the browser only warns in the console instead of
// blocking. If we forgot an allowed server, nothing on the site breaks. Switch to
// the enforcing header once the warnings stay empty.
//
// 'unsafe-inline' has to stay in script-src. Next.js puts small inline scripts in
// the page to hand React its data. The usual fix is a one-time token per request,
// but that would make every page render on demand and remove the prerendered
// shell that `cacheComponents: true` gives us.
//
// Where each allowed server comes from:
// - self: our own pages, our fonts (next/font/google copies them into the build)
// - image.tmdb.org: movie posters, loaded straight from TMDB
// - *.supabase.co: avatar images and browser calls to the database
// - va.vercel-scripts.com: analytics in dev and preview only. In production the
//   same script is served from our own domain.
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
