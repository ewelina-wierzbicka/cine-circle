import { Suspense } from 'react';
import { HomeHero } from '@/components/HomeHero';
import { RecentWatched } from '@/components/RecentWatched';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { TrendingMovie } from '@/types';

export default async function Home() {
  const trending = await getTrendingMovies().catch(() => [] as TrendingMovie[]);

  const hintTitles = trending
    .slice(0, 4)
    .map(({ id, title, type }) => ({ id, title, type }));

  return (
    <div className="min-h-full flex flex-col relative">
      <HomeHero hintTitles={hintTitles.length > 0 ? hintTitles : undefined} />
      <Suspense fallback={null}>
        <RecentWatched />
      </Suspense>
    </div>
  );
}
