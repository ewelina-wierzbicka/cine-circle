import Link from 'next/link';
import MediaPoster from '@/components/MediaPoster';
import { toHref } from '@/lib/mediaUtils';
import { TrendingMovie } from '@/types';

type Props = {
  recentPostersPromise: Promise<TrendingMovie[]>;
};

export async function RecentWatched({ recentPostersPromise }: Props) {
  const recentPosters = await recentPostersPromise;
  if (recentPosters.length === 0) return null;

  return (
    <div className="px-6 md:px-12 pb-8 relative">
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
