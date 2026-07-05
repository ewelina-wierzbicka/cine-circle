'use client';

import Input from '@/components/Input';
import SearchDropdownItem from '@/components/SearchDropdownItem';
import { useGetMedia } from '@/hooks/useGetMedia';
import { useGetMediaDetails } from '@/hooks/useGetMediaDetails';
import SearchIcon from '@/icons/MagnifyingGlass';
import { twMerge } from '@/lib/cn';
import { toHref } from '@/lib/mediaUtils';
import { FilterMediaType, MediaType } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
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
  hintTitles?: { id: number; title: string; type: MediaType }[];
  onDropdownVisibleChange?: (visible: boolean) => void;
};

export function SearchBox({
  initialQuery = '',
  initialType = 'all',
  hintTitles,
  onDropdownVisibleChange,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isSearchResultsPage = pathname === '/search';
  const [mediaType, setMediaType] = useState<FilterMediaType>(initialType);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, 300);
  const [displayCount, setDisplayCount] = useState(6);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Track search key to reset display count when query or type changes
  const searchKey = `${debouncedQuery}-${mediaType}`;
  const [lastSearchKey, setLastSearchKey] = useState(searchKey);

  if (searchKey !== lastSearchKey) {
    setLastSearchKey(searchKey);
    setDisplayCount(6);
    setActiveIndex(-1);
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetMedia({
      query: isSearchResultsPage ? '' : debouncedQuery,
      type: mediaType,
    });

  const allResults = data?.pages.flatMap((page) => page.results) ?? [];
  const visibleResults = allResults.slice(0, displayCount);

  const { data: detailedResults } = useGetMediaDetails({
    items: visibleResults,
    staleTime: 1000 * 60 * 5,
  });

  const displayResults = detailedResults ?? visibleResults;
  const showDropdown =
    !isSearchResultsPage && debouncedQuery.trim().length > 0 && showResults;

  useEffect(() => {
    onDropdownVisibleChange?.(showDropdown);
  }, [showDropdown, onDropdownVisibleChange]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = (q: string, t?: FilterMediaType) => {
    if (!q.trim()) return;
    router.push(
      `/search?query=${encodeURIComponent(q)}&type=${t ?? mediaType}`,
    );
  };

  useEffect(() => {
    if (isSearchResultsPage && debouncedQuery.trim()) {
      navigate(debouncedQuery, mediaType);
    }
  }, [debouncedQuery, mediaType, pathname]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown || displayResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = prev < displayResults.length - 1 ? prev + 1 : prev;

            // If navigating near the end, load more (only once per batch)
            if (
              next >= displayResults.length - 1 &&
              (displayCount < allResults.length || hasNextPage)
            ) {
              setDisplayCount((prevCount) => {
                const newCount = prevCount + 6;
                if (
                  newCount >= allResults.length &&
                  hasNextPage &&
                  !isFetchingNextPage
                ) {
                  fetchNextPage();
                }
                return newCount;
              });
              // Reset trigger after a short delay
              setTimeout(() => {}, 500);
            }

            // Scroll into view
            setTimeout(() => {
              itemRefs.current[next]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
              });
            }, 0);
            return next;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = prev > 0 ? prev - 1 : -1;
            // Scroll into view
            if (next >= 0) {
              setTimeout(() => {
                itemRefs.current[next]?.scrollIntoView({
                  block: 'nearest',
                  behavior: 'smooth',
                });
              }, 0);
            }
            return next;
          });
          break;

        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && displayResults[activeIndex]) {
            const item = displayResults[activeIndex];
            const href =
              item.media_type === 'series'
                ? `/series/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}?from=search`
                : `/movie/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}?from=search`;
            router.push(href);
          } else {
            navigate(query);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setShowResults(false);
          setActiveIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    displayResults,
    activeIndex,
    query,
    mediaType,
    router,
    allResults.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Intersection observer for infinite scroll within dropdown
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDisplayCount((prev) => {
            const newCount = prev + 6;
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
        <SearchIcon className="w-4 h-4 text-secondary shrink-0 mr-3" />
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
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0
              ? `search-result-${displayResults[activeIndex]?.id}`
              : undefined
          }
        />
        <div className="hidden sm:flex gap-1 ml-2 shrink-0">
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

      <div className="flex sm:hidden gap-2 mt-3">
        {FILTER_CHIPS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMediaType(value)}
            className={twMerge(
              'flex-1 py-2.5 rounded-xl text-sm font-mono tracking-[0.05em] transition-all duration-150 cursor-pointer',
              mediaType === value
                ? 'bg-mint text-dark font-medium'
                : 'bg-bg3 text-secondary border border-secondary/20',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Search results"
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
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  isActive={activeIndex === idx}
                  onMouseEnter={() => setActiveIndex(idx)}
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
          <div className="flex justify-center gap-2 mt-7 flex-wrap animate-fade-in">
            {hintTitles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  router.push(
                    `${toHref(item.id, item.title, item.type)}?from=search`,
                  )
                }
                className="px-4 py-1.5 rounded-full border border-secondary/20 text-secondary text-sm transition-all duration-150 hover:border-mint hover:text-mint cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBox;
