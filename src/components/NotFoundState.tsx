'use client';

import Button from '@/components/Button';
import { ClapperboardIcon } from '@/icons/Clapperboard';
import { useRouter } from 'next/navigation';

/**
 * The shared 404 content column. Both `not-found.tsx` files render it; each
 * supplies its own `<main>` wrapper, since the root one is full-screen with
 * ambient blobs and the `(app)` one sits inside the app shell.
 */
export function NotFoundState() {
  const router = useRouter();

  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-150 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(oklch(82%_0.10_165/0.07)_0%,transparent_65%)] blur-[40px]" />
      <div className="relative z-10 max-w-105 animate-fade-up text-center">
        <ClapperboardIcon className="mx-auto mb-5 h-14 w-14 text-accent opacity-50" />
        <p className="mb-2.5 label-mono text-accent">Error 404</p>
        <h1 className="display-serif">
          This <em className="text-accent">scene</em> doesn&rsquo;t exist
        </h1>
        <p className="mb-8 mt-3.5 text-sm text-secondary">
          The page you&rsquo;re looking for was cut from the final edit.
          Let&rsquo;s get you back to the story.
        </p>
        <Button handleClick={() => router.push('/')} className="w-auto">
          Back to home
        </Button>
      </div>
    </>
  );
}
