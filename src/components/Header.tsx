'use client';

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

  const handleLogin = () => {
    setDropdownOpen(false);
    router.push('/login');
  };

  return (
    <header className="relative z-50 flex items-center justify-between h-14 px-6 md:px-12 shrink-0">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="cineCircle logo"
          width={26}
          height={26}
          className="object-contain"
        />
        <span className="font-mono text-sm font-medium tracking-[0.05em] text-primary">
          cineCircle
        </span>
      </Link>
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ label, href, match }) => (
          <Link
            key={href}
            href={href}
            className={twMerge(
              'px-3 py-1.5 rounded-full text-sm font-sans font-medium tracking-[0.02em] transition-all duration-150',
              match(pathname)
                ? 'bg-white/4 border border-secondary/50 text-primary'
                : 'text-secondary hover:text-primary',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
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
            <span className="hidden sm:inline text-[20px] font-serif text-primary tracking-[0.06em]">
              Hello <em className="text-mint">{displayName}</em>!
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
              {NAV_ITEMS.filter(
                (el) => profile || el.label !== 'Collection',
              ).map(({ label, href, match }) => (
                <li
                  key={href}
                  role="menuitem"
                  tabIndex={0}
                  className={twMerge(
                    'md:hidden px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary border-b border-secondary/15 last:border-0',
                    match(pathname) && 'text-primary bg-bg3',
                  )}
                  onClick={() => {
                    router.push(href);
                    setDropdownOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(href);
                      setDropdownOpen(false);
                    } else if (e.key === 'Escape') {
                      setDropdownOpen(false);
                    }
                  }}
                >
                  {label}
                </li>
              ))}
              {profile ? (
                <>
                  <li
                    role="menuitem"
                    tabIndex={0}
                    className={twMerge(
                      'px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary border-b border-secondary/15 last:border-0',
                      pathname === '/profile' && 'text-primary bg-bg3',
                    )}
                    onClick={() => {
                      router.push('/profile');
                      setDropdownOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push('/profile');
                        setDropdownOpen(false);
                      } else if (e.key === 'Escape') {
                        setDropdownOpen(false);
                      }
                    }}
                  >
                    Profile
                  </li>

                  <li
                    role="menuitem"
                    tabIndex={0}
                    className="px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary border-b border-secondary/15 last:border-0"
                    onClick={handleLogout}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        void handleLogout();
                      } else if (e.key === 'Escape') {
                        setDropdownOpen(false);
                      }
                    }}
                  >
                    Logout
                  </li>
                </>
              ) : (
                <li
                  role="menuitem"
                  tabIndex={0}
                  className="px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary border-b border-secondary/15 last:border-0"
                  onClick={handleLogin}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      void handleLogin();
                    } else if (e.key === 'Escape') {
                      setDropdownOpen(false);
                    }
                  }}
                >
                  Login
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
