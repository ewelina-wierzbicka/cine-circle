import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useDetailStep(initialStep = 1) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const stepParam = searchParams.get('step');
  const step = stepParam === '2' ? 2 : initialStep;

  return {
    step,
    goToForm: () => router.push(`${pathname}?step=2`),
    goToInfo: () => router.push(pathname),
  };
}
