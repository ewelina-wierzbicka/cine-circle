'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
