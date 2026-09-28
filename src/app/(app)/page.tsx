import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

import { Suspense } from 'react';
import { SignedOutAbout } from '@/app/(app)/SignedOutAbout';
import { jsonLdScript, siteJsonLd } from '@/lib/jsonLd';
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
      {/* Outside every Suspense boundary, so it ships in the prerendered HTML. */}
      <script
        type="application/ld+json"
        // Built from typed app constants, never from user input.
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />
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
