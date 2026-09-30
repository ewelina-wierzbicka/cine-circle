import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

import { SignedOutAbout } from './SignedOutAbout';
import { HomeHero } from './HomeHero';
import { RecentWatched } from './RecentWatched';
import { jsonLdScript, siteJsonLd } from '@/lib/jsonLd';
import { getRecentWatched } from '@/services/getRecentWatched';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { TrendingMovie } from '@/types';
import { Suspense } from 'react';

export default async function Home() {
  const trending = await getTrendingMovies().catch(() => [] as TrendingMovie[]);

  const hintTitles = trending
    .slice(0, 4)
    .map(({ id, title, type }) => ({ id, title, type }));

  const recentPostersPromise = getRecentWatched();

  return (
    <div className="group relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />
      <div className="min-h-[calc(100vh-4rem)] group-has-data-home-about:min-h-0 group-has-data-home-about:pt-8 group-has-data-home-about:sm:pt-18 flex flex-col">
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
