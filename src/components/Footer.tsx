import Image from 'next/image';
import NextLink from 'next/link';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
] as const;

const CONTACT_EMAIL = 'info.midnightframe@gmail.com';

const linkClass =
  'text-sm font-sans text-secondary hover:text-primary transition-colors';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-6 py-8 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
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
            width={85}
            height={11}
            className="shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <span className="text-sm text-secondary group-hover:text-primary transition-colors">
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </span>
        </a>
      </div>
    </footer>
  );
}
