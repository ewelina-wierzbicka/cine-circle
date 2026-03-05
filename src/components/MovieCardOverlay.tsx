'use client';

import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function MovieCardOverlay({ children }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-dark/90 flex flex-col items-center justify-center gap-3 z-10"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
