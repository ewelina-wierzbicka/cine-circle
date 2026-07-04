import MediaPoster from '@/components/MediaPoster';
import { twMerge } from '@/lib/cn';
import { RecommendedMedia } from '@/types';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
  posterSrc?: string;
  posterTitle: string;
  step: number;
  infoSlot: ReactNode;
  formSlot: ReactNode;
  recommendations?: RecommendedMedia[];
};

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function MediaDetailWrapper({
  posterSrc,
  posterTitle,
  step,
  infoSlot,
  formSlot,
  recommendations,
}: Props) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-dark min-h-full">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_25%_35%,rgb(26,58,92)_0%,rgba(26,58,92,0.333)_35%,rgb(13,13,16)_68%)]" />
        <div className="absolute inset-0 z-1 bg-[linear-gradient(rgba(13,13,16,0.55)_0%,rgba(13,13,16,0.1)_40%,rgba(13,13,16,0.75)_100%)]" />
      </div>
      <div className="relative z-2 flex flex-col md:flex-row flex-1">
        <div
          className={twMerge(
            'h-[50vh] md:flex md:h-auto md:w-1/2 shrink-0 items-center justify-center py-12 px-6 md:px-12 pr-4',
            step === 2 ? 'hidden' : 'flex',
          )}
        >
          <MediaPoster
            src={posterSrc}
            title={posterTitle}
            className="rounded-2xl -rotate-[1.5deg] origin-center w-auto md:w-full h-full md:h-auto"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center py-12 px-6 md:pl-6 lg:pl-12 overflow-y-auto">
          {step === 1 ? infoSlot : formSlot}
        </div>
      </div>
      {recommendations && recommendations.length > 0 && step === 1 && (
        <div className="relative z-2 px-6 md:px-12 pb-8 pt-12">
          <span className="font-mono text-sm tracking-[0.2em] text-mint uppercase mb-4 block">
            More like this
          </span>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recommendations.map((rec) => {
              const slug = slugify(rec.title);
              const href =
                rec.media_type === 'series'
                  ? `/series/${rec.id}-${slug}`
                  : `/movie/${rec.id}-${slug}`;
              return (
                <Link key={rec.id} href={href} className="shrink-0 group">
                  <div className="rounded-xl overflow-hidden border border-white/[0.07] w-27.5 h-41.25 relative">
                    <MediaPoster
                      title={rec.title}
                      src={
                        rec.poster_path
                          ? `${TMDB_IMAGE_BASE}${rec.poster_path}`
                          : undefined
                      }
                      className="w-full h-full max-w-none rounded-xl"
                      sizes="110px"
                    />
                    {rec.genre && (
                      <span className="absolute bottom-1.5 left-1.5 font-mono text-xs tracking-[0.06em] uppercase bg-dark/70 text-mint px-1.5 py-0.5 rounded-full">
                        {rec.genre}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary mt-1.5 w-27.5 truncate group-hover:text-primary transition-colors">
                    {rec.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
