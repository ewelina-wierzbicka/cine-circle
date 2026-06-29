'use client';

import MediaPoster from '@/components/MediaPoster';
import type { NormalizedMedia } from '@/types';
import { useRouter } from 'next/navigation';
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
        ? `/series/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}?from=search`
        : `/movie/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}?from=search`;

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
        <MediaPoster
          title={item.title}
          src={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
              : undefined
          }
          className="w-8 h-12 rounded-md shadow-none!"
          sizes="32px"
        />

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
