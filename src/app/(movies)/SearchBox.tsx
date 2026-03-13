'use client';

import Input from '@/components/Input';
import { useSearch } from '@/hooks/useSearch';
import { MEDIA_TYPE_OPTIONS } from '@/lib/constants';
import { FilterMediaType } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBox() {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<FilterMediaType>('all');

  const { handleChange, handleSearch, handleKeyDown } = useSearch({
    onSearch: (query) => {
      router.push(
        `/search?query=${encodeURIComponent(query)}&type=${mediaType}`,
      );
    },
  });

  return (
    <div className="w-full md:w-1/2 px-6 flex gap-3">
      <select
        value={mediaType}
        onChange={(e) => setMediaType(e.target.value as FilterMediaType)}
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
      />
    </div>
  );
}
