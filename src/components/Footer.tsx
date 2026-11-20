import NextLink from 'next/link';
import { TmdbAttribution } from '@/components/TmdbAttribution';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
] as const;

const CONTACT_EMAIL = 'info.midnightframe@gmail.com';

const linkClass =
  'label-mono no-underline text-secondary hover:text-accent transition-colors';

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
          <p className="label-mono text-secondary mt-4 md:mt-0">
            © 2026 MIDNIGHTFRAME
          </p>
          <TmdbAttribution className="max-w-md bg-white/2 border border-secondary/15 rounded-2xl p-4" />
        </div>
      </div>
    </footer>
  );
}
