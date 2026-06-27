'use client';

import Input from '@/components/Input';
import Select from '@/components/Select';
import { useSearch } from '@/hooks/useSearch';
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-10 pb-12">
        <div className="w-full sm:w-[25%]">
          <p className="font-mono text-sm tracking-[0.2em] text-mint uppercase mb-2">
            My Collection
          </p>
          <h1 className="font-serif text-[clamp(32px,5vw,48px)] tracking-[-0.03em] leading-[0.95]">
            {tab === 'watched' ? (
              <em className="text-primary">Watched</em>
            ) : (
              <>
                To <em className="text-primary">Watch</em>
              </>
            )}
          </h1>
        </div>
        <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap w-full sm:w-[75%]">
          <div className="flex bg-bg2 border border-secondary/25 rounded-xl p-0.5 gap-0.5 shrink-0 w-full sm:w-auto ">
            <Link
              href="?tab=watched"
              className={`px-4.5 py-1.75 rounded-[10px] text-sm font-semibold tracking-[0.04em] transition-all duration-200 w-1/2 sm:w-auto ${
                tab === 'watched'
                  ? 'bg-mint text-dark'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Watched
            </Link>
            <Link
              href="?tab=to_watch"
              className={`px-4.5 py-1.75 rounded-[10px] text-sm font-semibold tracking-[0.04em] transition-all duration-200 w-1/2 sm:w-auto ${
                tab === 'to_watch'
                  ? 'bg-mint text-dark'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              To Watch
            </Link>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto flex-wrap justify-end">
            <div className="w-full sm:w-53.25">
              <Input
                type="text"
                placeholder="Filter…"
                onChange={handleChange}
                id="filter"
                className="h-10"
                variant="search"
              />
            </div>

            <Select
              value={mediaType}
              options={MEDIA_TYPE_OPTIONS}
              onChange={setMediaType}
              className="w-full sm:w-53.25"
            />
          </div>
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
