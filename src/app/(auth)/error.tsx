'use client';

import Button from '@/components/Button';
import { AlertCircleIcon } from '@/icons/AlertCircle';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center text-center">
      <AlertCircleIcon className="mb-5 h-12 w-12 text-error opacity-55" />
      <p className="mb-2 font-mono text-sm uppercase tracking-[0.22em] text-error">
        Something went wrong
      </p>
      <h1 className="font-serif text-[clamp(28px,5vw,38px)] leading-none tracking-[-0.03em]">
        We hit a <em className="text-error">glitch</em>
      </h1>
      <p className="mb-7 mt-3 text-sm leading-relaxed text-secondary">
        Something went wrong on our end. Try again or refresh the page.
      </p>
      <Button handleClick={() => reset()} size="small" className="w-auto">
        Try again
      </Button>
    </div>
  );
}
