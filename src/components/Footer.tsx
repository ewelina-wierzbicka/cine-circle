import NextLink from 'next/link';
import { TmdbAttribution } from '@/components/TmdbAttribution';

const NAV_LINKS = [
  { href: '/about', label: 'About', extra: '' },
  { href: '/privacy', label: 'Privacy', extra: ' Policy' },
  { href: '/terms', label: 'Terms', extra: ' & Conditions' },
] as const;

const CONTACT_EMAIL = 'info@midnightframe.app';

const linkClass =
  'ui-mono uppercase no-underline text-secondary hover:text-accent transition-colors';

export function Footer() {
  return (
    <footer className="relative z-10 shrink-0 border-t border-secondary/50 px-4 py-3 md:px-12">
      <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-between lg:gap-8">
        <div className="flex shrink-0 flex-col items-center gap-x-8 gap-y-1 lg:flex-row">
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-x-5 gap-y-1 lg:flex-nowrap lg:gap-x-8"
          >
            {NAV_LINKS.map(({ href, label, extra }) => (
              <NextLink key={href} href={href} className={linkClass}>
                {label}
                <span className="sr-only sm:not-sr-only">{extra}</span>
              </NextLink>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              Contact
            </a>
          </nav>
          <p className="ui-mono uppercase text-secondary hidden whitespace-nowrap sm:block">
            © 2026 MidnightFrame
          </p>
        </div>
        <TmdbAttribution className="max-w-xl" />
      </div>
    </footer>
  );
}
