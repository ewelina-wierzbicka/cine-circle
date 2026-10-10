'use client';

import { Footer } from '@/components/Footer';
import { usePathname } from 'next/navigation';

/** Static content routes. The footer is their only navigation, so it renders
 * there for everyone, signed in or out. */
const STATIC_ROUTES = ['/about', '/terms', '/privacy'];

type Props = {
  signedIn: boolean;
};

export function FooterSlot({ signedIn }: Props) {
  const pathname = usePathname();

  if (signedIn && !STATIC_ROUTES.includes(pathname)) return null;

  return <Footer />;
}
