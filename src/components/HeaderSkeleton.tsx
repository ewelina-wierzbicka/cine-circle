import AvatarIcon from '@/icons/Avatar';
import Image from 'next/image';
import Link from 'next/link';

export function HeaderSkeleton() {
  return (
    <header className="relative z-50 flex items-center justify-between h-14 px-6 md:px-12 shrink-0">
      <Link href="/" className="flex items-center gap-2.5">
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
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Main navigation"
      >
        <span className="px-3 py-1.5 text-sm font-sans font-medium tracking-[0.02em] text-secondary">
          Search
        </span>
        <span className="px-3 py-1.5 text-sm font-sans font-medium tracking-[0.02em] text-secondary">
          Collection
        </span>
      </nav>
      <AvatarIcon className="w-8 h-8 text-primary" />
    </header>
  );
}
