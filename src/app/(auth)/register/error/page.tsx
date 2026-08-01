import { LockXIcon } from '@/icons/LockX';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterErrorPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden p-6 bg-dark">
      <div
        className="absolute inset-0 opacity-40 bg-size-[48px_48px]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`,
        }}
      />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(65%_0.18_25/0.10)_0%,transparent_65%)]" />

      <Link
        href="/"
        className="absolute top-7 left-6 z-10 flex items-center gap-2.5"
      >
        <Image
          src="/logo.png"
          alt="cineCircle logo"
          width={26}
          height={26}
          className="object-contain"
        />
        <span className="font-mono text-sm font-medium tracking-[0.05em] text-primary">
          cineCircle
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-[380px] animate-fade-up text-center">
        <LockXIcon className="mx-auto mb-5 text-error" />
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-error">
          Account not created
        </p>
        <h1 className="mb-3.5 font-serif text-[clamp(32px,5vw,38px)] font-normal leading-[1.1] tracking-[-0.02em]">
          Couldn&rsquo;t <em className="text-error">create</em> your account
        </h1>
        <p className="mb-7 text-sm leading-relaxed text-secondary">
          Your account couldn&rsquo;t be set up — this can happen if that email
          is already registered or the connection dropped mid-request. No
          account was created.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-mint font-sans text-sm font-semibold uppercase tracking-[0.06em] text-dark transition-opacity hover:opacity-[0.82]"
          >
            Return to register
          </Link>
          <Link
            href="/"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
