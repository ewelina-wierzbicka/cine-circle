'use client';

import Input from '@/components/Input';
import Select from '@/components/Select';
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
    <div className="w-full px-6 flex flex-col md:flex-row gap-3 justify-center">
      <div className="w-full md:w-1/2 lg:w-1/3">
        <Input
          id="searchMedia"
          variant="search"
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          handleIconClick={handleSearch}
        />
      </div>
      <div className="w-full md:w-39 mt-2 md:mt-0">
        <Select
          value={mediaType}
          options={MEDIA_TYPE_OPTIONS}
          onChange={setMediaType}
        />
      </div>
    </div>
  );
}
