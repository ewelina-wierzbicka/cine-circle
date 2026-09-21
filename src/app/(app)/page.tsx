import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_TAGLINE } from '@/lib/seo';

export const metadata: Metadata = {
  // Bare tagline — the root template appends "| MidnightFrame", like every
  // other page, so the brand still lands in the tab and the SERP.
  title: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

import { Suspense } from 'react';
import { HomeHero } from '@/components/HomeHero';
import { RecentWatched } from '@/components/RecentWatched';
import { getRecentWatched } from '@/services/getRecentWatched';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { TrendingMovie } from '@/types';

export default async function Home() {
  const trending = await getTrendingMovies().catch(() => [] as TrendingMovie[]);

  const hintTitles = trending
    .slice(0, 4)
    .map(({ id, title, type }) => ({ id, title, type }));

  const recentPostersPromise = getRecentWatched();

  return (
    <div className="min-h-full flex flex-col relative">
      <HomeHero
        hintTitles={hintTitles.length > 0 ? hintTitles : undefined}
        recentPostersPromise={recentPostersPromise}
      />
      <Suspense fallback={null}>
        <RecentWatched recentPostersPromise={recentPostersPromise} />
      </Suspense>
    </div>
  );
}
