'use client';

import NextTopLoader from 'nextjs-toploader';

export function RouteProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader
        color="oklch(82% 0.1 165)"
        height={2}
        showSpinner={false}
        shadow={false}
        zIndex={60}
      />
      {children}
    </>
  );
}
