'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { NormalizedMedia } from '@/types';
import { forwardRef } from 'react';

type Props = {
  item: NormalizedMedia;
  idx?: number;
  isActive?: boolean;
  onMouseEnter?: () => void;
};

const SearchDropdownItem = forwardRef<HTMLButtonElement, Props>(
  ({ item, isActive, onMouseEnter }, ref) => {
    const router = useRouter();

    const href =
      item.media_type === 'series'
        ? `/series/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        : `/movie/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isActive}
        id={`search-result-${item.id}`}
        onMouseDown={() => router.push(href)}
        onMouseEnter={onMouseEnter}
        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-primary text-sm border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
          isActive ? 'bg-bg3' : 'hover:bg-bg3'
        }`}
      >
        {item.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
            alt={item.title}
            width={32}
            height={48}
            className="w-8 h-12 object-cover rounded-md bg-bg3"
          />
        ) : (
          <div
            className="w-8 h-12 relative rounded-sm"
            style={{
              background:
                'linear-gradient(160deg, #1A3A5CED 0%, #1a3a5c66 45%, #0d0d10 100%)',
            }}
          >
            <div
              className="absolute inset-0 rounded-sm pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.25)]"
              style={{
                background:
                  'linear-gradient(to top, rgba(13,13,16,0.92) 0%, rgba(13,13,16,0.5) 40%, transparent 75%)',
              }}
            />
          </div>
        )}

        <span className="flex-1 min-w-0">
          <span className="block line-clamp-1">{item.title}</span>
          <span className="block text-sm text-secondary font-mono mt-0.5">
            {item.director ? `${item.director} · ` : ''}
            {item.release_date ? item.release_date.slice(0, 4) : ''}
          </span>
        </span>

        <span className="text-secondary text-sm font-mono">
          {item.media_type}
        </span>
      </button>
    );
  },
);

SearchDropdownItem.displayName = 'SearchDropdownItem';

export default SearchDropdownItem;
