import { CinematicPoster } from '@/components/CinematicPoster';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { TrendingMovie } from '@/types';
import Image from 'next/image';
import { ReactNode } from 'react';

type AuthFormLayoutProps = {
  children: ReactNode;
};

export default async function AuthFormLayout({
  children,
}: AuthFormLayoutProps) {
  let posters: TrendingMovie[] | null = null;
  try {
    const trending = await getTrendingMovies();
    if (trending.length >= 6) posters = trending;
  } catch (err) {
    console.error('[AuthFormLayout] Failed to fetch trending posters:', err);
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <div className="relative w-full lg:w-1/2 bg-dark">
        <div
          className="absolute inset-0 opacity-40 bg-size-[48px_48px]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          }}
        />
        <div className="absolute top-7 left-6 flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="cineCircle logo"
            width={26}
            height={26}
            className="object-contain"
          />
          <span className="font-mono text-sm font-medium tracking-[0.05em] text-primary">
            cineCircle
          </span>
        </div>

        <div className="relative flex items-center justify-center h-full px-12">
          <div className="w-full max-w-90 animate-fade-up">{children}</div>
        </div>
      </div>
      {posters && (
        <div className="hidden lg:block flex-1 relative bg-dark">
          <div className="grid grid-cols-3 grid-rows-2 gap-0.75 h-full w-full">
            {posters.map((poster) => (
              <CinematicPoster
                key={poster.title}
                item={poster}
                className="h-full w-full"
              />
            ))}
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(13,13,16,0.92) 0%, rgba(13,13,16,0.3) 40%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(13,13,16,0.5) 0%, transparent 30%, transparent 60%, rgba(13,13,16,0.8) 100%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
