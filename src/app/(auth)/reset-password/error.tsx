'use client';

import { AuthErrorState } from '@/components/AuthErrorState';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ResetPasswordError({ reset }: Props) {
  return (
    <AuthErrorState
      eyebrow="Reset failed"
      title={
        <>
          Couldn&rsquo;t <em className="text-error">reset</em> your password
        </>
      }
      ctaLabel="Try again"
      reset={reset}
    />
  );
}
