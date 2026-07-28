'use client';

import Button from '@/components/Button';
import { ClapperboardIcon } from '@/icons/Clapperboard';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-dark px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute rounded-full blur-[55px] opacity-35 top-[-30%] left-[-5%] w-[60%] h-[130%] bg-[radial-gradient(#224c78_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-[55px] opacity-25 top-[10%] right-[-10%] w-[50%] h-[80%] bg-[radial-gradient(#755214_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-2xl bottom-[-20%] left-[30%] w-[40%] h-[80%] bg-[radial-gradient(oklch(82%_0.10_165/0.15)_0%,transparent_65%)]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-150 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(oklch(82%_0.10_165/0.07)_0%,transparent_65%)] blur-[40px]" />
      <div className="relative z-10 max-w-[420px] animate-fade-up text-center">
        <ClapperboardIcon className="mx-auto mb-5 h-14 w-14 text-mint opacity-50" />
        <p className="mb-2.5 font-mono text-sm uppercase tracking-[0.22em] text-mint">
          Error 404
        </p>
        <h1 className="font-serif text-[clamp(38px,5vw,52px)] leading-none tracking-[-0.03em]">
          This <em className="text-mint">scene</em> doesn&rsquo;t exist
        </h1>
        <p className="mb-8 mt-3.5 text-sm leading-relaxed text-secondary">
          The page you&rsquo;re looking for was cut from the final edit.
          Let&rsquo;s get you back to the story.
        </p>
        <Button
          handleClick={() => router.push('/')}
          size="small"
          className="w-auto px-8"
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
