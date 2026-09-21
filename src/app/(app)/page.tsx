import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

import { Suspense } from 'react';
import { HomeHero } from '@/components/HomeHero';
import { JsonLd } from '@/components/JsonLd';
import { organizationJsonLd, websiteJsonLd } from '@/lib/jsonLd';
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
      {/* Static graphs, so they belong in the prerendered shell rather than
          behind the RecentWatched Suspense boundary. */}
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
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
