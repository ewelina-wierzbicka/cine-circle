'use client';
import Input from '@/components/Input';
import { useSearch } from '@/hooks/useSearch';
import { UserMoviesPage } from '@/types';
import Link from 'next/link';
import UserMovieList from './UserMovieList';

type Props = {
  tab: 'to_watch' | 'watched';
  initialData: UserMoviesPage;
};

function tabLinkClass(active: boolean, rounded: string) {
  return `w-full h-10 ${rounded} text-dark font-bold uppercase cursor-pointer ${
    active ? 'bg-primary' : 'bg-secondary'
  } flex items-center justify-center`;
}

export default function MyMovies({ tab, initialData }: Props) {
  const { debouncedQuery, handleChange, handleSearch, handleKeyDown } =
    useSearch({
      onSearch: () => {},
      debounceMs: 500,
    });

  return (
    <>
      <div className="flex items-center w-full lg:gap-8 flex-col lg:flex-row">
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
        <div className="w-full lg:w-1/3 mb-8">
          <Input
            id="searchMovie"
            variant="search"
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            handleIconClick={handleSearch}
            placeholder={`Search in ${
              tab === 'to_watch' ? 'movies to watch' : 'watched movies'
            }`}
          />
        </div>
      </div>
      <UserMovieList
        status={tab}
        initialData={initialData}
        searchQuery={debouncedQuery}
      />
    </>
  );
}
