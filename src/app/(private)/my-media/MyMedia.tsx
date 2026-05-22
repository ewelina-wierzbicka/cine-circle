'use client';

import Select from '@/components/Select';
import { useSearch } from '@/hooks/useSearch';
import SearchIcon from '@/icons/MagnifyingGlass';
import { MEDIA_TYPE_OPTIONS } from '@/lib/constants';
import { FilterMediaType, UserMediaPage } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import UserMediaList from './UserMediaList';

type Props = {
  tab: 'to_watch' | 'watched';
  initialData: UserMediaPage;
};

export default function MyMedia({ tab, initialData }: Props) {
  const [mediaType, setMediaType] = useState<FilterMediaType>('all');
  const { debouncedQuery, handleChange } = useSearch({
    onSearch: () => {},
    debounceMs: 400,
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-10 pb-8">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-mint uppercase mb-2">
            My Collection
          </p>
          <h1 className="font-serif text-[clamp(32px,5vw,48px)] tracking-[-0.03em] leading-[0.95]">
            {tab === 'watched' ? (
              <em className="text-mint">Watched</em>
            ) : (
              <>
                To <em className="text-primary">Watch</em>
              </>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 bg-bg2 border border-white/[0.07] rounded-xl px-3.5 py-2">
            <SearchIcon className="w-3 h-3 text-dim shrink-0" />
            <input
              type="text"
              placeholder="Filter…"
              onChange={handleChange}
              className="bg-transparent outline-none text-primary text-xs w-24 placeholder:text-dim"
            />
          </div>
          <div className="flex bg-bg2 border border-white/[0.07] rounded-xl p-0.5 gap-0.5">
            <Link
              href="?tab=watched"
              className={`px-4.5 py-1.75 rounded-[10px] text-[11px] font-semibold tracking-[0.04em] transition-all duration-200 ${
                tab === 'watched'
                  ? 'bg-mint text-dark'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Watched
            </Link>
            <Link
              href="?tab=to_watch"
              className={`px-4.5 py-1.75 rounded-[10px] text-[11px] font-semibold tracking-[0.04em] transition-all duration-200 ${
                tab === 'to_watch'
                  ? 'bg-mint text-dark'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              To Watch
            </Link>
          </div>
          <Select
            value={mediaType}
            options={MEDIA_TYPE_OPTIONS}
            onChange={setMediaType}
            className="w-28"
          />
        </div>
      </div>

      <UserMediaList
        watchStatus={tab}
        initialData={initialData}
        searchQuery={debouncedQuery}
        mediaType={mediaType}
      />
    </>
  );
}
