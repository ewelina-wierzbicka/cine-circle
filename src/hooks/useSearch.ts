import { useEffect, useState } from 'react';

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
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Plain effect timer, not use-debounce: its pending-timer ref wedges when the timer
  // fires while this instance sits in a hidden Activity, so the value never updates again
  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedQuery(searchQuery),
      debounceMs ?? 0,
    );
    return () => clearTimeout(id);
  }, [searchQuery, debounceMs]);

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
