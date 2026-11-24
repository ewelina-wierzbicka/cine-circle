'use client';

import { useDetailStep } from '@/hooks/useDetailStep';

// The only step-2 marker on the page. It streams in from its own Suspense
// boundary so the TMDB body stays in the prerendered shell, and
// `MediaDetailWrapper` reacts to it through `:has()`.
export default function DetailStepFlag() {
  const { step } = useDetailStep();
  if (step !== 2) return null;
  return <span hidden data-step="two" />;
}
