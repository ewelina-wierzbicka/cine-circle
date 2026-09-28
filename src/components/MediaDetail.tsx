'use client';

import DetailStepSync from '@/components/DetailStepSync';
import MediaDetailWrapper from '@/components/MediaDetailWrapper';
import MediaInfoHeader from '@/components/MediaInfoHeader';
import { DetailStepContext } from '@/hooks/useDetailStep';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { NormalizedMedia } from '@/types';
import { ReactNode, Suspense, useMemo, useState } from 'react';

type Props = {
  media: NormalizedMedia;
  actions: ReactNode;
  form: ReactNode;
};

// Renders the TMDB block exactly once, on every request. `actions` and `form`
// are server-rendered Suspense subtrees handed down from `MediaPage`; only
// they depend on the signed-in user.
//
// The step is local state, not `?step=2`. Reading the search params up here
// would make the whole route dynamic and leave `loading.tsx` as the entire
// prerendered shell.
export default function MediaDetail({ media, actions, form }: Props) {
  const [step, setStep] = useState(1);

  const stepContext = useMemo(
    () => ({
      step,
      goToForm: () => setStep(2),
      goToInfo: () => setStep(1),
    }),
    [step],
  );

  return (
    <DetailStepContext.Provider value={stepContext}>
      <Suspense fallback={null}>
        <DetailStepSync onStep={setStep} />
      </Suspense>
      <MediaDetailWrapper
        posterSrc={
          media.poster_path ? tmdbImageUrl(media.poster_path) : undefined
        }
        posterTitle={media.title}
        step={step}
        infoSlot={
          <div className="flex flex-col w-full animate-fade-up md:max-w-120">
            <MediaInfoHeader media={media} />
            {actions}
          </div>
        }
        formSlot={form}
        recommendations={media.recommendations}
      />
    </DetailStepContext.Provider>
  );
}
