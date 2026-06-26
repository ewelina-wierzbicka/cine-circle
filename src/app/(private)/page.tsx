import MediaPoster from '@/components/MediaPoster';
import SearchBox from '@/components/SearchBox';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getUserMediaList } from '@/services/getUserMedia';
import { TrendingMovie, UserMedia } from '@/types';
import Link from 'next/link';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

function toRecentPoster(item: UserMedia) {
  return {
    title: item.media.title,
    year: (item.media.release_date ?? '').slice(0, 4),
    genre: item.media.media_type === 'movie' ? 'Movie' : 'Series',
    posterUrl: item.media.poster_path
      ? `${TMDB_IMAGE_BASE}${item.media.poster_path}`
      : undefined,
    id: item.media.tmdb_id,
  };
}

export default async function Home() {
  let recentPosters: TrendingMovie[] = [];
  let trendingTitles: string[] = [];
  try {
    const result = await getUserMediaList('watched', 0);
    recentPosters = result.media.slice(0, 8).map(toRecentPoster);
  } catch (err) {
    console.error(' Failed to fetch recent Posters:', err);
  }
  try {
    const trending = await getTrendingMovies();
    trendingTitles = trending.slice(0, 4).map((p) => p.title);
  } catch (err) {
    console.error(' Failed to fetch trending titles:', err);
  }

  return (
    <div className="min-h-full flex flex-col relative">
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 relative z-10">
        <h2 className="font-serif text-[46px] xl:text-[52px] tracking-[-0.03em] text-center leading-none mb-3 animate-fade-up">
          What will you
          <br />
          <em className="text-mint">watch next?</em>
        </h2>
        <p className="text-secondary text-md text-center mb-12 animate-fade-in [animation-delay:80ms]">
          Search any title to add it to your circle
        </p>
        <div className="w-full max-w-160 animate-fade-up [animation-delay:120ms]">
          <SearchBox
            hintTitles={trendingTitles.length > 0 ? trendingTitles : undefined}
          />
        </div>
      </div>

      {recentPosters.length > 0 && (
        <div className="px-6 md:px-12 pb-8 relative">
          <div className="flex justify-between mb-4">
            <span className="font-mono text-sm tracking-[0.2em] text-secondary uppercase">
              Recently Watched
            </span>
            <Link
              href="/my-media"
              className="font-mono text-sm text-mint tracking-[0.08em] hover:opacity-70 transition-opacity"
            >
              SEE ALL →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentPosters.map((poster, i) => {
              const href =
                poster.genre === 'Movie'
                  ? `/movie/${poster.id}`
                  : `/series/${poster.id}`;
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
      )}
    </div>
  );
}
