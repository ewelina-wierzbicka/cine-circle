import MediaPoster from '@/components/MediaPoster';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { TrendingMovie } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
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
        <div className="absolute -top-30 left-1/2 w-120 h-120 -translate-x-1/2 bg-[radial-gradient(circle,oklch(0.82_0.1_250/0.1)_0%,transparent_65%)]" />
        <div className="absolute -bottom-30 left-1/2 w-120 h-120 -translate-x-1/2 bg-[radial-gradient(circle,oklch(0.82_0.1_165/0.1)_0%,transparent_65%)]" />
        <Link
          href="/"
          className="absolute top-7 left-6 z-10 flex items-center gap-2.5"
        >
          <Image
            src="/logo.png"
            alt="MidnightFrame logo"
            width={26}
            height={26}
            className="object-contain"
          />
          <span className="font-mono text-sm font-medium tracking-[0.05em] text-primary">
            MidnightFrame
          </span>
        </Link>

        <div className="relative flex items-center justify-center h-full px-6 md:px-12">
          <div className="w-full max-w-90 animate-fade-up">{children}</div>
        </div>
      </div>
      {posters && (
        <div className="hidden lg:block flex-1 relative bg-dark">
          <div className="grid grid-cols-3 grid-rows-2 gap-0.75 h-full w-full">
            {posters.map((poster) => (
              <MediaPoster
                key={poster.title}
                title={poster.title}
                src={poster.posterUrl}
                className="h-full shadow-none!"
                sizes="16vw"
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
