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
      <div className="flex items-center w-full md:gap-8 flex-col md:flex-row">
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
        <div className="flex gap-3 w-full flex-col sm:flex-row mb-8 ">
          <div className="w-full lg:w-1/3 flex gap-3">
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
          <div className="w-full sm:w-39 shrink-0">
            <Select
              value={mediaType}
              options={MEDIA_TYPE_OPTIONS}
              onChange={setMediaType}
            />
          </div>
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
