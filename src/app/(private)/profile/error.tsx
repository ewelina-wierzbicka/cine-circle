'use client';

import Button from '@/components/Button';

export default function ProfileError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-6 py-12 text-center">
      <h1 className="font-serif text-4xl mb-4">Something went wrong</h1>
      <p className="text-secondary mb-6">Could not load your profile.</p>
      <Button handleClick={reset} className="w-auto px-8 mx-auto">
        Try again
      </Button>
    </div>
  );
}
