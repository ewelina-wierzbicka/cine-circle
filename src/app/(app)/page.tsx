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
    <div className="group relative">
      <div className="min-h-[calc(100vh-4rem)] group-has-data-home-about:min-h-0 group-has-data-home-about:pt-18 flex flex-col">
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
