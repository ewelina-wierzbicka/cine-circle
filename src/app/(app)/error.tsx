'use client';

import Button from '@/components/Button';
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
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-blue border border-white/10 p-10 text-center animate-fade-up">
        <span className="font-mono text-sm tracking-[0.2em] text-mint uppercase">
          Error
        </span>
        <h1 className="mt-6 font-serif text-5xl leading-none tracking-[-0.03em] md:text-6xl">
          The reel
          <br />
          <em className="text-mint">snapped.</em>
        </h1>
        <div className="mx-auto mt-6 mb-6 h-px w-12 bg-mint/60" />
        <p className="text-sm text-secondary leading-relaxed mb-8">
          Something interrupted the show. Try again, or head back home.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button handleClick={() => reset()} className="sm:flex-1">
            Try again
          </Button>
          <Button
            variant="outlined"
            handleClick={() => router.push('/')}
            className="sm:flex-1"
          >
            Go home
          </Button>
        </div>
        {error.digest && (
          <p className="mt-8 font-mono text-xs tracking-[0.08em] text-secondary/50">
            {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
