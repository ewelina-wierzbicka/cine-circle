import type { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata: Metadata = {
  title: 'Page not found — CineCircle',
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-full items-center justify-center px-6 py-16">
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] h-150 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(oklch(82%_0.10_165/0.07)_0%,transparent_65%)] blur-[40px]"
        aria-hidden="true"
      />
      <NotFoundContent />
    </div>
  );
}
