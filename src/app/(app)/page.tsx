import { Suspense } from 'react';
import { HomeHero } from '@/components/HomeHero';
import { RecentWatched } from '@/components/RecentWatched';
import { RecentWatchedSkeleton } from '@/components/RecentWatchedSkeleton';
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
      <Suspense fallback={<RecentWatchedSkeleton />}>
        <RecentWatched recentPostersPromise={recentPostersPromise} />
      </Suspense>
    </div>
  );
}
