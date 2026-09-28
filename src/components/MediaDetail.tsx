'use client';

import MediaDetailWrapper from '@/components/MediaDetailWrapper';
import MediaInfoHeader from '@/components/MediaInfoHeader';
import { useDetailStep } from '@/hooks/useDetailStep';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { NormalizedMedia } from '@/types';
import { ReactNode } from 'react';

type Props = {
  media: NormalizedMedia;
  initialStep?: number;
  fromSearch?: boolean;
  actions: ReactNode;
  form: ReactNode;
};

// Renders the TMDB block exactly once, on every request. `actions` and `form`
// are server-rendered Suspense subtrees handed down from `MediaPage`; only
// they depend on the signed-in user.
export default function MediaDetail({
  media,
  initialStep = 1,
  fromSearch = false,
  actions,
  form,
}: Props) {
  const { step } = useDetailStep(initialStep);

  return (
    <MediaDetailWrapper
      posterSrc={
        media.poster_path ? tmdbImageUrl(media.poster_path) : undefined
      }
      posterTitle={media.title}
      step={step}
      infoSlot={
        <div className="flex flex-col w-full animate-fade-up md:max-w-120">
          <MediaInfoHeader media={media} fromSearch={fromSearch} />
          {actions}
        </div>
      }
      formSlot={form}
      recommendations={media.recommendations}
    />
  );
}
