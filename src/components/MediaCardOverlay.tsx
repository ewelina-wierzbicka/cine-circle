'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
};

export default function MediaCardOverlay({ href, children }: Props) {
  const router = useRouter();
  return (
    <div
      className="absolute inset-0 flex flex-col items-end justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-10 cursor-pointer"
      onClick={() => router.push(href)}
    >
      <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/70 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col w-full gap-2 p-2.5">
        {children}
      </div>
    </div>
  );
}
