import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useDetailStep(initialStep = 1) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stepParam = searchParams.get('step');
  const step = stepParam === '2' ? 2 : initialStep;

  // Every other param is kept, so context like the originating collection tab
  // survives a trip through the entry form.
  const hrefForStep = (nextStep?: '2') => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStep) params.set('step', nextStep);
    else params.delete('step');
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return {
    step,
    goToForm: () => router.push(hrefForStep('2')),
    goToInfo: () => router.push(hrefForStep()),
  };
}
