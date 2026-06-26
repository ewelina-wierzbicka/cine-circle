import MediaPoster from '@/components/MediaPoster';
import { ReactNode } from 'react';

type Props = {
  posterSrc?: string;
  posterTitle: string;
  step: number;
  infoSlot: ReactNode;
  formSlot: ReactNode;
};

export default function MediaDetailWrapper({
  posterSrc,
  posterTitle,
  step,
  infoSlot,
  formSlot,
}: Props) {
  return (
    <div className="relative flex flex-col overflow-hidden bg-dark min-h-full">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_25%_35%,rgb(26,58,92)_0%,rgba(26,58,92,0.333)_35%,rgb(13,13,16)_68%)]" />
        <div className="absolute inset-0 z-1 bg-[linear-gradient(rgba(13,13,16,0.55)_0%,rgba(13,13,16,0.1)_40%,rgba(13,13,16,0.75)_100%)]" />
      </div>
      <div className="relative z-2 flex flex-1">
        <div className="hidden md:flex w-1/2 shrink-0 items-center justify-center py-8 px-6 md:px-12 pr-4">
          <MediaPoster
            src={posterSrc}
            title={posterTitle}
            className="rounded-2xl -rotate-[1.5deg] origin-center',
"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center py-8 px-6 md:px-12 md:pl-10 overflow-y-auto">
          {step === 1 ? infoSlot : formSlot}
        </div>
      </div>
    </div>
  );
}
