'use client';

import { createContext, useContext } from 'react';

export type DetailStep = {
  step: number;
  goToForm: () => void;
  goToInfo: () => void;
};

// The step used to live in `?step=2`, which meant `MediaDetail` had to call
// `useSearchParams()` and every media route de-opted out of prerendering.
// It is plain client state now, shared through context because `MediaActions`
// and `MediaEntryForm` are server-rendered subtrees handed to `MediaDetail`
// as props — functions cannot cross that boundary.
export const DetailStepContext = createContext<DetailStep | null>(null);

export function useDetailStep(): DetailStep {
  const context = useContext(DetailStepContext);
  if (!context) {
    throw new Error('useDetailStep must be used inside <MediaDetail>');
  }
  return context;
}
