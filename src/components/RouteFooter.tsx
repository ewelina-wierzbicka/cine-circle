'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { isInfiniteScrollRoute } from '@/lib/infiniteScrollRoutes';

type Props = {
  placement: 'in-flow' | 'pinned';
};

export function RouteFooter({ placement }: Props) {
  const pathname = usePathname();
  const pinned = isInfiniteScrollRoute(pathname);
  return (placement === 'pinned') === pinned ? <Footer /> : null;
}
