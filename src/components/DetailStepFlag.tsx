'use client';

import { useDetailStep } from '@/hooks/useDetailStep';

export default function DetailStepFlag() {
  const { step } = useDetailStep();
  if (step !== 2) return null;
  return <span hidden data-step="two" />;
}
