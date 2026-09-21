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
      {/* Header is h-16, so the hero + recently watched block fills the first screen.
          ponytail: signed-out pages carry `data-home-about`, and `group-has-*` collapses
          that full-height block so the About section starts above the fold. Pure CSS,
          so the shell still prerenders without knowing the session. */}
      <div className="min-h-[calc(100vh-4rem)] group-has-[[data-home-about]]:min-h-0 flex flex-col">
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
