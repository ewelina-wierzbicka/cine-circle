import type { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata: Metadata = {
  title: 'Page not found — CineCircle',
};

export default function NotFound() {
  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-dark px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute rounded-full blur-[55px] opacity-35 top-[-30%] left-[-5%] w-[60%] h-[130%] bg-[radial-gradient(#224c78_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-[55px] opacity-25 top-[10%] right-[-10%] w-[50%] h-[80%] bg-[radial-gradient(#755214_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-2xl bottom-[-20%] left-[30%] w-[40%] h-[80%] bg-[radial-gradient(oklch(82%_0.10_165/0.15)_0%,transparent_65%)]" />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] h-150 w-150 -translate-x-1/2 rounded-full bg-[radial-gradient(oklch(82%_0.10_165/0.07)_0%,transparent_65%)] blur-[40px]"
        aria-hidden="true"
      />
      <NotFoundContent />
    </main>
  );
}
