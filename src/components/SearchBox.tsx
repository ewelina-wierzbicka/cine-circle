'use client';

import Input from '@/components/Input';
import SearchDropdownItem from '@/components/SearchDropdownItem';
import { useGetMedia } from '@/hooks/useGetMedia';
import { useGetMediaDetails } from '@/hooks/useGetMediaDetails';
import SearchIcon from '@/icons/MagnifyingGlass';
import { twMerge } from '@/lib/cn';
import { FilterMediaType } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

const FILTER_CHIPS: { label: string; value: FilterMediaType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'Series', value: 'series' },
];

type Props = {
  initialQuery?: string;
  initialType?: FilterMediaType;
  hintTitles?: string[];
};

export function SearchBox({
  initialQuery = '',
  initialType = 'all',
  hintTitles,
}: Props) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<FilterMediaType>(initialType);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, 300);
  const [displayCount, setDisplayCount] = useState(6);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Track search key to reset display count when query or type changes
  const searchKey = `${debouncedQuery}-${mediaType}`;
  const [lastSearchKey, setLastSearchKey] = useState(searchKey);

  if (searchKey !== lastSearchKey) {
    setLastSearchKey(searchKey);
    setDisplayCount(6);
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetMedia({
      query: debouncedQuery,
      type: mediaType,
      staleTime: 1000 * 60 * 5,
    });

  const allResults = data?.pages.flatMap((page) => page.results) ?? [];
  const visibleResults = allResults.slice(0, displayCount);

  const { data: detailedResults } = useGetMediaDetails({
    items: visibleResults,
    staleTime: 1000 * 60 * 5,
  });

  const displayResults = detailedResults ?? visibleResults;
  const showDropdown = debouncedQuery.trim().length > 0 && showResults;

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Intersection observer for infinite scroll within dropdown
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // Show 6 more results
          setDisplayCount((prev) => {
            const newCount = prev + 6;
            // If we've shown all available results and there are more pages, fetch next page
            if (
              newCount >= allResults.length &&
              hasNextPage &&
              !isFetchingNextPage
            ) {
              fetchNextPage();
            }
            return newCount;
          });
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (
      currentRef &&
      displayCount < allResults.length + (hasNextPage ? 1 : 0)
    ) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [
    displayCount,
    allResults.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const navigate = (q: string) => {
    if (!q.trim()) return;
    router.push(`/search?query=${encodeURIComponent(q)}&type=${mediaType}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(query);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={twMerge(
          'flex items-center rounded-2xl border transition-all duration-200 pl-5 pr-1.5 py-1.5',
          focused
            ? 'bg-bg2 border-mint shadow-[0_0_0_3px_oklch(82%_0.10_165/0.12)]'
            : 'border-secondary/50',
        )}
      >
        <SearchIcon className="w-4 h-4 text-primary/40 shrink-0 mr-3" />
        <Input
          id="search-input"
          type="text"
          value={query}
          placeholder="Search movies & series…"
          className="flex-1 bg-transparent border-none h-10 text-sm pl-0 pr-0 rounded-none focus:border-transparent focus:bg-transparent"
          handleChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          handleKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <div className="flex gap-1 ml-2 shrink-0">
          {FILTER_CHIPS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMediaType(value)}
              className={twMerge(
                'px-3 py-1.5 rounded-xl text-sm font-mono tracking-[0.05em] transition-all duration-150 cursor-pointer whitespace-nowrap',
                mediaType === value
                  ? 'bg-mint text-dark font-medium'
                  : 'text-secondary hover:text-primary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-30 bg-bg2 border border-secondary/30 rounded-xl mt-2 shadow-lg animate-fade-in max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-secondary text-sm">Loading...</div>
          ) : displayResults.length === 0 ? (
            <div className="p-4 text-secondary text-sm">No results found</div>
          ) : (
            <>
              {displayResults.map((item, idx) => (
                <SearchDropdownItem
                  key={`${item.media_type}-${item.id}-${idx}`}
                  item={item}
                />
              ))}
              {(displayCount < allResults.length || hasNextPage) && (
                <div
                  ref={loadMoreRef}
                  className="p-3 text-center text-secondary text-sm"
                >
                  {isFetchingNextPage && 'Loading more…'}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {hintTitles && (
        <div className="absolute flex justify-center w-full">
          <div className="flex gap-2 mt-7 flex-wrap animate-fade-in">
            {hintTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(title)}
                className="px-4 py-1.5 rounded-full border border-secondary/20 text-secondary text-sm transition-all duration-150 hover:border-mint hover:text-mint cursor-pointer"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBox;
