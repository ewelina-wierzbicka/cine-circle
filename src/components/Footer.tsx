import { twMerge } from '@/lib/cn';
import Image from 'next/image';
import NextLink from 'next/link';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
] as const;

const CONTACT_EMAIL = 'info.midnightframe@gmail.com';

const linkClass =
  'text-sm font-sans text-secondary hover:text-primary transition-colors';

type Props = {
  /** Pins the footer to the bottom of the scroll container. Used on /search,
   * where infinite scroll pushes a static footer out of reach. */
  pinned?: boolean;
};

export function Footer({ pinned = false }: Props) {
  return (
    <footer
      className={twMerge(
        // relative z-10: the movie/series backdrop is a `fixed inset-0` layer
        // that paints over any static sibling. Everything on those pages is
        // explicitly lifted above it.
        'relative z-10 border-t border-secondary/50 px-6 py-8 md:px-12',
        pinned && 'sticky bottom-0 z-10 bg-dark/95 backdrop-blur-sm py-4',
      )}
    >
      <div
        className={twMerge(
          'mx-auto flex flex-col gap-6 md:flex-row md:items-start md:justify-between',
          pinned && 'gap-3 md:items-center',
        )}
      >
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          {NAV_LINKS.map(({ href, label }) => (
            <NextLink key={href} href={href} className={linkClass}>
              {label}
            </NextLink>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            Contact
          </a>
        </nav>
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 max-w-sm group"
          aria-label="TMDB — This product uses the TMDB API but is not endorsed or certified by TMDB."
        >
          <Image
            src="/tmdb.svg"
            alt="TMDB"
            width={75}
            height={10}
            className="shrink-0 mt-1.5"
          />
          <span className="text-sm text-secondary group-hover:text-primary transition-colors">
            This product uses TMDB and the TMDB APIs but is not endorsed,
            certified, or otherwise approved by TMDB.
          </span>
        </a>
      </div>
    </footer>
  );
}
