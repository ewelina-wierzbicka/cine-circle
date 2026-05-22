import { CinematicPoster } from '@/components/CinematicPoster';
import SearchBox from '@/components/SearchBox';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getUserMediaList } from '@/services/getUserMedia';
import { TrendingMovie, UserMedia } from '@/types';
import Link from 'next/link';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

function toRecentPoster(item: UserMedia): TrendingMovie {
  return {
    title: item.media.title,
    year: (item.media.release_date ?? '').slice(0, 4),
    genre: item.media.media_type === 'movie' ? 'Film' : 'Series',
    posterUrl: item.media.poster_path
      ? `${TMDB_IMAGE_BASE}${item.media.poster_path}`
      : undefined,
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
      <div className="absolute inset-0">
        <div className="absolute rounded-full blur-[55px] opacity-35 top-[-30%] left-[-5%] w-[60%] h-[130%] bg-[radial-gradient(ellipse,#1a3a5c_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-[55px] opacity-25 top-[10%] right-[-10%] w-[50%] h-[80%] bg-[radial-gradient(ellipse,#6b4a10_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-2xl bottom-[-20%] left-[30%] w-[40%] h-[80%] bg-[radial-gradient(ellipse,oklch(82%_0.10_165/0.15)_0%,transparent_65%)]" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 relative z-10">
        <h2 className="font-serif text-[clamp(32px,4.5vw,52px)] font-normal tracking-[-0.03em] text-center leading-none mb-3 animate-fade-up">
          What will you
          <br />
          <em className="text-mint">watch next?</em>
        </h2>
        <p className="text-secondary text-[13px] text-center mb-10 animate-fade-in [animation-delay:80ms]">
          Search any title to add it to your circle
        </p>
        <div className="w-full max-w-160 animate-fade-up [animation-delay:120ms]">
          <SearchBox
            hintTitles={trendingTitles.length > 0 ? trendingTitles : undefined}
          />
        </div>
      </div>

      {recentPosters.length > 0 && (
        <div className="px-6 md:px-12 pb-8 relative z-10">
          <div className="flex justify-between mb-4">
            <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
              Recently Watched
            </span>
            <Link
              href="/my-media"
              className="font-mono text-[9px] text-mint tracking-[0.08em] hover:opacity-70 transition-opacity"
            >
              SEE ALL →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentPosters.map((poster, i) => (
              <div
                key={i}
                className="shrink-0 rounded-[10px] overflow-hidden border border-white/[0.07] w-27.5 h-41.25"
              >
                <CinematicPoster
                  item={poster}
                  className="w-full h-full"
                  sizes="110px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
