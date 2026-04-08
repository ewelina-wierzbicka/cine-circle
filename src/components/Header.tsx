'use client';

import AvatarIcon from '@/icons/Avatar';
import { twMerge } from '@/lib/cn';
import { MEDIA_TYPE_OPTIONS } from '@/lib/constants';
import { logout } from '@/services/auth';
import { FilterMediaType } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Input from './Input';
import Select from './Select';
import { createClient } from '@/lib/supabase/client';

type Props = {
  searchProps?: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleIconClick: () => void;
    error?: string;
  };
  mediaType?: FilterMediaType;
  setMediaType?: React.Dispatch<React.SetStateAction<FilterMediaType>>;
  isLoggedIn?: boolean;
};

const dropdownOptions = [
  {
    label: 'My Media',
    href: '/my-media',
    match: (pathname: string) => pathname === '/my-media',
  },
  {
    label: 'Settings',
    href: '/settings',
    match: (pathname: string) => pathname === '/settings',
  },
];

export default function Header({
  searchProps,
  mediaType,
  setMediaType,
  isLoggedIn: initialIsLoggedIn,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session?.user);
      },
    );
    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const handleDropdownOpen = () => setDropdownOpen(true);
  const handleDropdownClose = () => setDropdownOpen(false);
  const handleDropdownToggle = () => setDropdownOpen((prev) => !prev);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleDropdownClose();
  };

  return (
    <header>
      <div className="mx-auto px-4 py-6 w-full max-w-content flex align-start justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>
        {searchProps && mediaType && setMediaType && (
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="w-50">
              <Input
                id="searchMediaHeader"
                variant="search"
                handleChange={searchProps.handleChange}
                handleKeyDown={searchProps.handleKeyDown}
                handleIconClick={searchProps.handleIconClick}
                error={searchProps.error}
              />
            </div>
            <div className="w-full sm:w-39">
              <Select
                value={mediaType}
                options={MEDIA_TYPE_OPTIONS}
                onChange={setMediaType}
              />
            </div>
          </div>
        )}
        {isLoggedIn && (
          <div
            className="relative pb-2"
            onMouseEnter={handleDropdownOpen}
            onMouseLeave={handleDropdownClose}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                handleDropdownClose();
              }
            }}
          >
            <button
              className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              aria-controls="user-dropdown-menu"
              type="button"
              onClick={handleDropdownToggle}
              onKeyDown={handleMenuKeyDown}
            >
              <AvatarIcon className="w-8 h-8 text-primary" />
            </button>
            {dropdownOpen && (
              <ul
                id="user-dropdown-menu"
                className="absolute right-0 z-50 mt-2 w-38 rounded-2xl bg-dark border border-neutral-300/20 overflow-hidden shadow-xl"
                role="menu"
                aria-label="User menu"
              >
                {dropdownOptions.map((option) => (
                  <li
                    key={option.href}
                    role="menuitem"
                    tabIndex={0}
                    className={twMerge(
                      'px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-neutral-300/10 select-none',
                      option.match(pathname) &&
                        'font-semibold bg-neutral-300/5',
                    )}
                    onClick={() => {
                      router.push(option.href);
                      handleDropdownClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(option.href);
                        handleDropdownClose();
                      } else if (e.key === 'Escape') {
                        handleDropdownClose();
                      }
                    }}
                  >
                    {option.label}
                  </li>
                ))}
                <li
                  role="menuitem"
                  tabIndex={0}
                  className="px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-neutral-300/10 select-none"
                  onClick={handleLogout}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      void handleLogout();
                    } else if (e.key === 'Escape') {
                      handleDropdownClose();
                    }
                  }}
                >
                  Logout
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
