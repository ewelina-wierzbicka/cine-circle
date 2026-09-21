import { Suspense } from 'react';
import { SignedOutAbout } from '@/app/(app)/SignedOutAbout';
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
    <div className="relative">
      {/* Header is h-16, so the hero + recently watched block fills the first screen. */}
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <HomeHero
          hintTitles={hintTitles.length > 0 ? hintTitles : undefined}
          recentPostersPromise={recentPostersPromise}
        />
        <Suspense fallback={null}>
          <RecentWatched recentPostersPromise={recentPostersPromise} />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <SignedOutAbout />
      </Suspense>
    </div>
  );
}
