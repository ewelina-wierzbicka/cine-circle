'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const CLASS_NAME =
  'inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-accent transition-colors duration-150 mb-9 self-start';

// The destination depends on `?from=search`. Reading it here, behind the
// Suspense boundary in `MediaInfoHeader`, keeps the search param out of the
// page root so the route still prerenders. `MediaBackLinkFallback` is the
// prerendered default and is identical to the `/collection` branch, so the
// swap costs no layout shift.
export default function MediaBackLink() {
  const fromSearch = useSearchParams().get('from') === 'search';

  return (
    <Link href={fromSearch ? '/' : '/collection'} className={CLASS_NAME}>
      {fromSearch ? '← BACK TO SEARCH' : '← BACK TO COLLECTION'}
    </Link>
  );
}

export function MediaBackLinkFallback() {
  return (
    <Link href="/collection" className={CLASS_NAME}>
      ← BACK TO COLLECTION
    </Link>
  );
}
