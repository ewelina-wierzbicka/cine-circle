import MediaPoster from '@/components/MediaPoster';
import { MediaPosterLink } from '@/components/MediaPosterLink';
import { twMerge } from '@/lib/cn';
import { toHref } from '@/lib/mediaUtils';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { RecommendedMedia } from '@/types';
import { ReactNode } from 'react';

type Props = {
  posterSrc?: string;
  posterTitle: string;
  step: number;
  infoSlot: ReactNode;
  formSlot: ReactNode;
  whereToWatchSlot?: ReactNode;
  recommendations?: RecommendedMedia[];
};

export default function MediaDetailWrapper({
  posterSrc,
  posterTitle,
  step,
  infoSlot,
  formSlot,
  whereToWatchSlot,
  recommendations,
}: Props) {
  // `shrink-0` below is load-bearing: `overflow-hidden` zeroes the wrapper's
  // automatic minimum size, so as a flex child of `main` it would shrink to the
  // viewport and clip everything below instead of letting `main` scroll.
  return (
    <div className="relative flex shrink-0 flex-col overflow-hidden bg-dark min-h-full">
      <div className="fixed inset-0 z-0 pointer-events-none bg-dark">
        <div className="absolute inset-0 bg-[radial-gradient(at_25%_35%,rgb(26,58,92)_0%,rgba(26,58,92,0.333)_35%,rgb(13,13,16)_68%)]" />
        <div className="absolute inset-0 z-1 bg-[linear-gradient(rgba(13,13,16,0.55)_0%,rgba(13,13,16,0.1)_40%,rgba(13,13,16,0.75)_100%)]" />
      </div>
      <div className="relative z-2 grid flex-1 grid-cols-1 md:grid-cols-2 md:grid-rows-[1fr_auto]">
        <div
          className={twMerge(
            'h-[50vh] md:flex md:h-auto md:col-start-1 md:row-start-1 shrink-0 items-center justify-center pt-12 px-6 md:px-12 pr-4',
            step === 2 ? 'hidden pb-12' : 'flex pb-12 md:pb-0',
          )}
        >
          <MediaPoster
            src={posterSrc}
            title={posterTitle}
            className="rounded-2xl -rotate-[1.5deg] origin-center w-auto md:w-full h-full md:h-auto"
            priority
            fetchPriority="high"
          />
        </div>
        <div
          className={twMerge(
            'flex flex-col justify-center pt-12 px-6 md:col-start-2 md:row-start-1 md:pl-6 lg:pl-12',
            step === 1 ? 'pb-0' : 'pb-12',
          )}
        >
          {step === 1 ? infoSlot : formSlot}
        </div>
        {step === 1 && (
          <div className="px-6 pb-12 md:col-start-2 md:row-start-2 md:pl-6 lg:pl-12">
            <div className="md:max-w-120">{whereToWatchSlot}</div>
          </div>
        )}
      </div>
      {recommendations && recommendations.length > 0 && step === 1 && (
        <div className="relative z-2 px-6 md:px-12 py-12">
          <span className="label-mono text-accent mb-4 block">
            More like this
          </span>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recommendations.map((rec) => (
              <MediaPosterLink
                key={rec.id}
                href={toHref(rec.id, rec.title, rec.media_type)}
                title={rec.title}
                src={
                  rec.poster_path ? tmdbImageUrl(rec.poster_path) : undefined
                }
                genre={rec.genre}
                showTitle
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
