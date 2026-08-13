'use client';

import { AuthErrorState } from '@/components/AuthErrorState';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ForgotPasswordError({ reset }: Props) {
  return (
    <AuthErrorState
      eyebrow="Request failed"
      title={
        <>
          Couldn&rsquo;t send your <em className="text-error">reset link</em>
        </>
      }
      ctaLabel="Return to reset password"
      reset={reset}
    />
  );
}
