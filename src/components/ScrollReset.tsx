'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

export default function ScrollReset() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (!pathname.startsWith('/movie/') && !pathname.startsWith('/series/'))
      return;
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [pathname]);
  return null;
}
