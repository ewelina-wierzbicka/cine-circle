'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

export default function ScrollReset() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    // Also reset any nested scroll containers inside main
    main?.querySelectorAll('[class*="overflow-y"]').forEach((el) => {
      (el as HTMLElement).scrollTop = 0;
    });
  }, [pathname]);
  return null;
}
