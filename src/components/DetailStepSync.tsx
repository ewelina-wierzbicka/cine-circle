'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  onStep: (step: number) => void;
};

// `?step=2` is no longer the source of truth for the detail step, but
// `MediaCard`'s "I watched" action still deep-links to it. This reads the
// param and promotes the state, and it is the only thing on the media pages
// that touches `useSearchParams()`. It renders null inside its own Suspense
// boundary so the rest of the route still prerenders.
export default function DetailStepSync({ onStep }: Props) {
  const searchParams = useSearchParams();
  const wantsForm = searchParams.get('step') === '2';

  useEffect(() => {
    onStep(wantsForm ? 2 : 1);
  }, [wantsForm, onStep]);

  return null;
}
