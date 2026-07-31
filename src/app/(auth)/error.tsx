'use client';

import Button from '@/components/Button';
import { AlertCircleIcon } from '@/icons/AlertCircle';
import { useEffect } from 'react';
import Link from 'next/link';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-dark">
      <div
        className="absolute inset-0 opacity-40 bg-size-[48px_48px]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`,
        }}
      />
      <div className="absolute -bottom-30 left-1/2 w-120 h-120 -translate-x-1/2 bg-[radial-gradient(circle,oklch(0.82_0.1_165/0.1)_0%,transparent_65%)]" />

      <div className="relative flex h-full items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-90 animate-fade-up">
          <div className="mb-8">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-mint/20 bg-mint/10">
              <AlertCircleIcon className="h-[18px] w-[18px] text-mint" />
            </div>

            <h1 className="mb-2 font-serif text-4xl font-normal leading-[1.1] tracking-[-0.02em]">
              Something went
              <br />
              <em className="text-mint">wrong</em>
            </h1>
            <p className="text-sm text-secondary">
              We could not finish that request.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <p className="text-sm leading-relaxed text-secondary">
              An error happened while loading this page. Try again, or head back
              to sign in.
            </p>

            {error.digest && (
              <p className="font-mono text-xs tracking-[0.08em] text-secondary/50">
                {error.digest}
              </p>
            )}

            <Button handleClick={() => reset()} className="mt-1">
              Try again
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-secondary">
            Back to{' '}
            <Link
              href="/login"
              className="text-mint transition-opacity hover:opacity-80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
