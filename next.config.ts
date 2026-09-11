import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    // Constrained to TMDB's bucket widths so srcset candidates map 1:1 onto
    // them. The defaults go up to 3840, and every candidate above 780 would
    // resolve to TMDB `original` (multi-MB) for a poster rendered at 500px.
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
