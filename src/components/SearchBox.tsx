'use client';

import Input from '@/components/Input';
import SearchIcon from '@/icons/MagnifyingGlass';
import { twMerge } from '@/lib/cn';
import { FilterMediaType } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const FILTER_CHIPS: { label: string; value: FilterMediaType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'Series', value: 'series' },
];

type Props = {
  initialQuery?: string;
  initialType?: FilterMediaType;
  hintTitles?: string[];
};

export function SearchBox({
  initialQuery = '',
  initialType = 'all',
  hintTitles,
}: Props) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<FilterMediaType>(initialType);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(initialQuery);

  const navigate = (q: string) => {
    if (!q.trim()) return;
    router.push(`/search?query=${encodeURIComponent(q)}&type=${mediaType}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(query);
    }
  };

  return (
    <div>
      <div
        className={twMerge(
          'flex items-center rounded-2xl border transition-all duration-200 pl-5 pr-1.5 py-1.5',
          focused
            ? 'bg-bg2 border-mint shadow-[0_0_0_3px_oklch(82%_0.10_165/0.12)]'
            : 'border-white/12',
        )}
      >
        <SearchIcon className="w-4 h-4 text-primary/40 shrink-0 mr-3" />
        <Input
          id="search-input"
          type="text"
          value={query}
          placeholder="Search movies & series…"
          className="flex-1 bg-transparent border-none h-10 text-[15px] pl-0 pr-0 rounded-none focus:border-transparent focus:bg-transparent"
          handleChange={(e) => setQuery(e.target.value)}
          handleKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className="flex gap-1 ml-2 shrink-0">
          {FILTER_CHIPS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMediaType(value)}
              className={twMerge(
                'px-3 py-1.5 rounded-xl text-[11px] font-mono tracking-[0.05em] transition-all duration-150 cursor-pointer whitespace-nowrap',
                mediaType === value
                  ? 'bg-mint text-dark font-medium'
                  : 'text-dim hover:text-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {query.length === 0 && hintTitles && (
        <div className="flex justify-center gap-2 mt-7 flex-wrap animate-fade-in">
          {hintTitles.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate(title)}
              className="px-4 py-1.5 rounded-full border border-white/[0.07] text-dim text-xs transition-all duration-150 hover:border-mint hover:text-mint cursor-pointer"
            >
              {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
