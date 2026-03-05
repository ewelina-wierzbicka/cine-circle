import { useState } from 'react';

export function useDetailStep(initialStep = 1) {
  const [step, setStep] = useState(initialStep);

  return {
    step,
    goToForm: () => setStep(2),
    goToInfo: () => setStep(1),
  };
}
