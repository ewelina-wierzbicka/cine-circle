'use client';

import Input from '@/components/Input';
import { useSearch } from '@/hooks/useSearch';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const { showError, handleChange, handleSearch, handleKeyDown } = useSearch({
    onSearch: (query) => {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    },
  });

  return (
    <div className="w-full sm:w-3/4 h-[calc(100vh-240px)] sm:h-[40vh] border border-primary flex items-center justify-center rounded-3xl flex-wrap flex-col">
      <p className="text-base sm:text-xl mb-4 sm:mb-8">
        Which movie are you looking for today?
      </p>
      <div className="w-full sm:w-1/3 px-6 sm:px-0">
        <Input
          id="searchMovie"
          type="search"
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          handleIconClick={handleSearch}
          error={showError ? 'Please enter at least 3 characters' : ''}
        />
      </div>
    </div>
  );
}
