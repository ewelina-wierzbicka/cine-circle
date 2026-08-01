'use client';

import Button from '@/components/Button';
import { AlertCircleIcon } from '@/icons/AlertCircle';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-full items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-150 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(oklch(65%_0.18_25/0.08)_0%,transparent_65%)] blur-[40px]" />
      <div className="relative z-10 max-w-[420px] animate-fade-up text-center">
        <AlertCircleIcon className="mx-auto mb-5 h-14 w-14 text-error opacity-55" />
        <p className="mb-2.5 font-mono text-sm uppercase tracking-[0.22em] text-error">
          Something went wrong
        </p>
        <h1 className="font-serif text-[clamp(34px,5vw,46px)] leading-none tracking-[-0.03em]">
          We hit a <em className="text-error">glitch</em>
        </h1>
        <p className="mb-8 mt-3.5 text-sm leading-relaxed text-secondary">
          Something on our end failed to load. Try again, or head back and pick
          up where you left off.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button handleClick={() => reset()} className="w-auto">
            Try again
          </Button>
          <Button
            variant="outlined"
            handleClick={() => router.push('/')}
            className="w-auto"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
