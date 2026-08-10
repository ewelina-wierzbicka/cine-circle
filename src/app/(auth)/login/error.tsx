'use client';

import Button from '@/components/Button';
import { LockXIcon } from '@/icons/LockX';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LoginError({ reset }: Props) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-dark">
      <div
        className="absolute inset-0 opacity-40 bg-size-[48px_48px]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`,
        }}
      />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(65%_0.18_25/0.10)_0%,transparent_65%)]" />

      <header className="absolute top-7 left-6 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="MidnightFrame logo"
            width={26}
            height={26}
            className="object-contain"
          />
          <span className="font-mono text-sm font-medium tracking-[0.05em] text-primary">
            MidnightFrame
          </span>
        </Link>
      </header>
      <main className="relative flex h-full items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-[380px] animate-fade-up text-center">
          <LockXIcon className="mx-auto mb-5 text-error" />
          <p className="mb-6 font-mono text-sm uppercase tracking-[0.22em] text-error">
            Sign-in failed
          </p>
          <h1 className="mb-3.5 font-serif text-[clamp(32px,5vw,38px)] font-normal leading-[1.1] tracking-[-0.02em]">
            Couldn&rsquo;t <em className="text-error">verify</em> you
          </h1>
          <p className="mb-7 text-sm leading-relaxed text-secondary">
            Something on our end failed. Try again, or continue as a guest.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button handleClick={reset} className="w-auto">
              Return to sign in
            </Button>
            <Link
              href="/"
              className="text-sm text-secondary transition-colors hover:text-primary"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
