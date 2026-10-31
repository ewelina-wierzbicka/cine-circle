'use client';

import { MenuOption } from '@/components/MenuOption';
import { Logo } from '@/components/Logo';
import AvatarIcon from '@/icons/Avatar';
import { twMerge } from '@/lib/cn';
import { logout } from '@/services/auth';
import { UserProfile } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type HeaderProps = {
  profile?: UserProfile | null;
};

const NAV_ITEMS = [
  {
    label: 'Search',
    href: '/',
    match: (p: string) => p === '/',
  },
  {
    label: 'Collection',
    href: '/collection',
    match: (p: string) => p.startsWith('/collection'),
  },
];

export default function Header({ profile }: HeaderProps) {
  const { display_name: displayName, avatar_url: avatarUrl } = profile || {};
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const navigateTo = (href: string) => {
    router.push(href);
    setDropdownOpen(false);
  };

  const activateOnKeyDown =
    (activate: () => void) => (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      } else if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

  return (
    <header className="relative z-50 flex items-center justify-between h-16 px-6 md:px-12 shrink-0">
      <Logo priority />
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ label, href, match }) => (
          <Link
            key={href}
            href={href}
            className={twMerge(
              'px-3 py-1.5 rounded-full border text-sm font-medium tracking-[0.02em] transition-all duration-150',
              match(pathname)
                ? 'border-secondary/50 bg-white/4 text-primary'
                : 'border-transparent text-secondary hover:text-primary',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      {!profile ? (
        <Link
          href="/login"
          className="rounded-full bg-accent text-dark px-4 py-1.5 text-sm font-semibold tracking-[0.02em] transition-opacity hover:opacity-[0.82]"
        >
          Sign in
        </Link>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDropdownOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="flex items-center gap-4 bg-transparent border-none cursor-pointer p-0"
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            aria-controls="user-dropdown-menu"
            onClick={() => setDropdownOpen((p) => !p)}
          >
            {displayName && (
              <span className="hidden sm:inline text-sm text-primary tracking-[0.02em]">
                Hello <span className="text-accent">{displayName}</span>!
              </span>
            )}
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <AvatarIcon className="w-8 h-8 text-primary" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full pt-3 w-40 z-50">
              <ul
                id="user-dropdown-menu"
                className="rounded-xl bg-bg2 border border-secondary/25 overflow-hidden shadow-xl"
                role="menu"
                aria-label="User menu"
              >
                {NAV_ITEMS.map(({ label, href, match }) => (
                  <MenuOption
                    key={href}
                    role="menuitem"
                    tabIndex={0}
                    selected={match(pathname)}
                    className="md:hidden"
                    onClick={() => navigateTo(href)}
                    onKeyDown={activateOnKeyDown(() => navigateTo(href))}
                  >
                    {label}
                  </MenuOption>
                ))}
                <MenuOption
                  role="menuitem"
                  tabIndex={0}
                  selected={pathname === '/profile'}
                  onClick={() => navigateTo('/profile')}
                  onKeyDown={activateOnKeyDown(() => navigateTo('/profile'))}
                >
                  Profile
                </MenuOption>

                <MenuOption
                  role="menuitem"
                  tabIndex={0}
                  onClick={handleLogout}
                  onKeyDown={activateOnKeyDown(() => void handleLogout())}
                >
                  Logout
                </MenuOption>
              </ul>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
