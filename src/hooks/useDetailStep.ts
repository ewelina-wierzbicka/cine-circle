import { useState } from 'react';
import { useIsTablet } from './useIsTablet';

export function useDetailStep() {
  const [step, setStep] = useState(1);
  const isTablet = useIsTablet();

  return {
    step,
    isTablet,
    goToForm: () => setStep(2),
    goToInfo: () => setStep(1),
  };
}
