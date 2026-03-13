'use client';
import Input from '@/components/Input';
import { useSearch } from '@/hooks/useSearch';
import { FilterMediaType, MediaType, UserMediaPage } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import UserMediaList from './UserMediaList';
import { MEDIA_TYPE_OPTIONS } from '@/lib/constants';

type Props = {
  tab: 'to_watch' | 'watched';
  initialData: UserMediaPage;
};

function tabLinkClass(active: boolean, rounded: string) {
  return `w-full h-10 ${rounded} text-dark font-bold uppercase cursor-pointer ${
    active ? 'bg-primary' : 'bg-secondary'
  } flex items-center justify-center`;
}

export default function MyMedia({ tab, initialData }: Props) {
  const [mediaType, setMediaType] = useState<FilterMediaType>('all');
  const { debouncedQuery, handleChange, handleSearch, handleKeyDown } =
    useSearch({
      onSearch: () => {},
      debounceMs: 500,
    });

  return (
    <>
      <div className="flex items-center w-full lg:gap-8 flex-col lg:flex-row">
        <div className="mb-8 w-full lg:w-1/3 flex">
          <Link
            className={tabLinkClass(tab === 'to_watch', 'rounded-l-3xl')}
            href="?tab=to_watch"
          >
            To Watch
          </Link>
          <Link
            className={tabLinkClass(tab === 'watched', 'rounded-r-3xl')}
            href="?tab=watched"
          >
            Watched
          </Link>
        </div>
        <div className="w-full lg:w-1/3 mb-8 flex gap-3">
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            className="rounded-3xl bg-neutral-300/20 pl-4 pr-4 h-10 outline-none focus:ring-4 focus:ring-neutral-300/20 shrink-0 cursor-pointer"
          >
            {MEDIA_TYPE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value} className="bg-dark">
                {label}
              </option>
            ))}
          </select>
          <Input
            id="searchMedia"
            variant="search"
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            handleIconClick={handleSearch}
            placeholder={`Search in ${
              tab === 'to_watch' ? 'to watch' : 'watched'
            }`}
          />
        </div>
      </div>
      <UserMediaList
        status={tab}
        initialData={initialData}
        searchQuery={debouncedQuery}
        mediaType={mediaType}
      />
    </>
  );
}
