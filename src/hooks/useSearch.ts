import { useState } from 'react';
import { useDebounce } from 'use-debounce';

interface UseSearchOptions {
  onSearch: (query: string) => void;
  initialQuery?: string;
  debounceMs?: number;
}

export function useSearch({
  onSearch,
  initialQuery = '',
  debounceMs,
}: UseSearchOptions) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(searchQuery, debounceMs ?? 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return {
    debouncedQuery,
    handleChange,
    handleSearch,
    handleKeyDown,
  };
}
