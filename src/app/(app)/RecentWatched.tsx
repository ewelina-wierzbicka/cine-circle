import { MediaPosterLink } from '@/components/MediaPosterLink';
import { toHref } from '@/lib/mediaUtils';
import { TrendingMovie } from '@/types';
import Link from 'next/link';

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
          className="font-mono text-sm text-accent tracking-[0.08em] hover:opacity-70 transition-opacity"
        >
          SEE ALL →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {recentPosters.map((poster, i) => (
          <MediaPosterLink
            key={i}
            href={toHref(poster.id, poster.title, poster.type)}
            title={poster.title}
            src={poster.posterUrl}
          />
        ))}
      </div>
    </div>
  );
}
