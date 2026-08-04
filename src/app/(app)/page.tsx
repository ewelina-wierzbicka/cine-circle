import { Suspense } from 'react';
import { HomeHero } from '@/components/HomeHero';
import MediaPoster from '@/components/MediaPoster';
import { toHref } from '@/lib/mediaUtils';
import { createClient } from '@/lib/supabase/server';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getUserMediaList } from '@/services/getUserMedia';
import { TrendingMovie, UserMedia } from '@/types';
import Link from 'next/link';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

function toRecentPoster(item: UserMedia) {
  return {
    title: item.media.title,
    year: (item.media.release_date ?? '').slice(0, 4),
    type: item.media.media_type,
    posterUrl: item.media.poster_path
      ? `${TMDB_IMAGE_BASE}${item.media.poster_path}`
      : undefined,
    id: item.media.tmdb_id,
  };
}

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

async function RecentWatched() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let recentPosters: TrendingMovie[] = [];
  try {
    const result = await getUserMediaList('watched', 0);
    recentPosters = result.media.slice(0, 8).map(toRecentPoster);
  } catch {
    // silently fail — no recent posters shown
  }

  if (recentPosters.length === 0) return null;

  return (
    <div data-has-recent-media className="px-6 md:px-12 pb-8 relative">
      <div className="flex justify-between mb-4">
        <span className="font-mono text-sm tracking-[0.2em] text-secondary uppercase">
          Recently Watched
        </span>
        <Link
          href="/collection"
          className="font-mono text-sm text-mint tracking-[0.08em] hover:opacity-70 transition-opacity"
        >
          SEE ALL →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {recentPosters.map((poster, i) => {
          const href = toHref(poster.id, poster.title, poster.type);
          return (
            <Link
              key={i}
              href={href}
              className="shrink-0 rounded-xl overflow-hidden border border-white/[0.07] w-27.5 h-41.25"
            >
              <MediaPoster
                title={poster.title}
                src={poster.posterUrl}
                className="w-full h-full max-w-none rounded-xl"
                sizes="110px"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
