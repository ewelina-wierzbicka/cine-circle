'use client';

import { twMerge } from '@/lib/cn';
import { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
};

export function BackToTopLink({ className, children }: Props) {
  return (
    <button
      type="button"
      onClick={() =>
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
      }
      className={twMerge(
        'text-accent hover:opacity-80 transition-opacity',
        className,
      )}
    >
      {children}
    </button>
  );
}
