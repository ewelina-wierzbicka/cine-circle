'use client';

import Input from '@/components/Input';
import { useSearch } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  const router = useRouter();

  const { handleChange, handleSearch, handleKeyDown } = useSearch({
    onSearch: (query) => {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    },
  });

  return (
    <div className="w-full md:w-1/2 px-6">
      <Input
        id="searchMovie"
        variant="search"
        handleChange={handleChange}
        handleKeyDown={handleKeyDown}
        handleIconClick={handleSearch}
      />
    </div>
  );
}
