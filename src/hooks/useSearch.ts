import { useState } from 'react';

interface UseSearchOptions {
  onSearch: (query: string) => void;
  initialQuery?: string;
  minLength?: number;
}

export function useSearch({
  onSearch,
  initialQuery = '',
  minLength = 3,
}: UseSearchOptions) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showError, setShowError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowError(false);
  };

  const handleSearch = () => {
    if (searchQuery.length >= minLength) {
      setShowError(false);
      onSearch(searchQuery);
    } else {
      setShowError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return {
    searchQuery,
    showError,
    handleChange,
    handleSearch,
    handleKeyDown,
  };
}
