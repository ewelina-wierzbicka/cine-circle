'use client';

import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function MediaCardOverlay({ children }: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-end justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-10"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/70 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col w-full gap-2 p-2.5">
        {children}
      </div>
    </div>
  );
}
