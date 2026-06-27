'use client';

import AvatarIcon from '@/icons/Avatar';
import { twMerge } from '@/lib/cn';
import { logout } from '@/services/auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    label: 'Search',
    href: '/',
    match: (p: string) => p === '/',
  },
  {
    label: 'Collection',
    href: '/my-media',
    match: (p: string) => p.startsWith('/my-media'),
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
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
      <nav className="flex items-center gap-1" aria-label="Main navigation">
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
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
          aria-label="User menu"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-controls="user-dropdown-menu"
          onClick={() => setDropdownOpen((p) => !p)}
        >
          <AvatarIcon className="w-8 h-8 text-primary" />
        </button>

        {dropdownOpen && (
          <ul
            id="user-dropdown-menu"
            className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-bg2 border border-white/[0.07] overflow-hidden shadow-xl z-50"
            role="menu"
            aria-label="User menu"
          >
            <li
              role="menuitem"
              tabIndex={0}
              className={twMerge(
                'px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-white/4 select-none text-secondary',
                pathname === '/profile' && 'text-primary font-medium',
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
              className="px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-white/4 select-none text-secondary border-t border-white/[0.07]"
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
          </ul>
        )}
      </div>
    </header>
  );
}
