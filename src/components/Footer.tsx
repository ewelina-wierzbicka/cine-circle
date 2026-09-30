import Image from 'next/image';
import NextLink from 'next/link';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
] as const;

const CONTACT_EMAIL = 'info.midnightframe@gmail.com';

const linkClass =
  'font-mono text-sm uppercase tracking-[0.14em] no-underline text-secondary hover:text-accent transition-colors';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-secondary/50 px-6 py-8 md:px-12">
      <div className="flex flex-col gap-6 items-center md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-10 gap-y-3 justify-center md:justify-start"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <NextLink key={href} href={href} className={linkClass}>
                {label}
              </NextLink>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              Contact
            </a>
          </nav>
        </div>
        <div className="flex flex-col gap-4 items-center md:items-end">
          <p className="font-mono text-sm tracking-[0.14em] text-secondary mt-4 md:mt-0">
            © 2026 MIDNIGHTFRAME
          </p>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 max-w-md bg-white/2 border border-secondary/15 rounded-2xl p-4 group"
            aria-label="TMDB — This product uses TMDB and the TMDB APIs but is not endorsed,
              certified, or otherwise approved by TMDB."
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
      </div>
    </footer>
  );
}
