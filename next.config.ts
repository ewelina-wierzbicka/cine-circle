import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow the e2e test server to use a separate build dir so it can run
  // alongside the main dev server without a .next/dev/lock conflict.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  cacheComponents: true,
  images: {
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
