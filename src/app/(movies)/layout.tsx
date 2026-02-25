'use client';

import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { useSearch } from '@/hooks/useSearch';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || '';

  const { searchQuery, handleChange, handleSearch, handleKeyDown, showError } =
    useSearch({
      onSearch: (query) =>
        router.replace(`/search?query=${encodeURIComponent(query)}`),
      initialQuery,
      minLength: 3,
    });

  const [debouncedQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 3) {
      router.replace(`/search?query=${encodeURIComponent(debouncedQuery)}`);
    }
  }, [debouncedQuery, router]);

  return (
    <>
      <Header
        searchProps={{
          handleChange,
          handleKeyDown,
          handleIconClick: handleSearch,
          error: showError ? 'Please enter at least 3 characters' : '',
        }}
      />
      <div className="w-full max-w-content min-h-full-screen mx-auto py-8 px-4">
        {children}
      </div>
    </>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loader fullScreen={true} />}>
      <SearchLayout>{children}</SearchLayout>
    </Suspense>
  );
}
