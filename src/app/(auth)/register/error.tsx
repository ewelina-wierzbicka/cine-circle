'use client';

import { AuthErrorState } from '@/components/AuthErrorState';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RegisterError({ reset }: Props) {
  return (
    <AuthErrorState
      eyebrow="Account not created"
      title={
        <>
          Couldn&rsquo;t <em className="text-error">create</em> your account
        </>
      }
      ctaLabel="Return to register"
      reset={reset}
    />
  );
}
