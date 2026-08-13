'use client';

import { AuthErrorState } from '@/components/AuthErrorState';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LoginError({ reset }: Props) {
  return (
    <AuthErrorState
      eyebrow="Sign-in failed"
      title={
        <>
          Couldn&rsquo;t <em className="text-error">verify</em> you
        </>
      }
      ctaLabel="Return to sign in"
      reset={reset}
    />
  );
}
