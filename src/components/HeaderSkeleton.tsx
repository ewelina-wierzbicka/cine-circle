import { LogoLink } from '@/components/LogoLink';
import AvatarIcon from '@/icons/Avatar';

export function HeaderSkeleton() {
  return (
    <header className="relative z-50 flex items-center justify-between h-16 px-6 md:px-12 shrink-0">
      <LogoLink priority />
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Main navigation"
      >
        <span className="px-3 py-1.5 rounded-full border border-transparent text-sm font-medium tracking-[0.02em] text-secondary">
          Search
        </span>
        <span className="px-3 py-1.5 rounded-full border border-transparent text-sm font-medium tracking-[0.02em] text-secondary">
          Collection
        </span>
      </nav>
      <AvatarIcon className="w-8 h-8 text-primary" />
    </header>
  );
}
