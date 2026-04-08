'use client';

import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { useSearch } from '@/hooks/useSearch';
import { FilterMediaType } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentQuery = searchParams.get('query') || '';
  const currentType = searchParams.get('type') || 'all';
  const [mediaType, setMediaType] = useState<FilterMediaType>(
    currentType as FilterMediaType,
  );
  const isInitialMount = useRef(true);

  const { debouncedQuery, handleChange, handleSearch, handleKeyDown } =
    useSearch({
      onSearch: (query) =>
        router.replace(
          `/search?query=${encodeURIComponent(query)}&type=${mediaType}`,
        ),
      initialQuery: currentQuery,
      debounceMs: 500,
    });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (
      debouncedQuery &&
      (debouncedQuery !== currentQuery || mediaType !== currentType)
    ) {
      router.replace(
        `/search?query=${encodeURIComponent(debouncedQuery)}&type=${mediaType}`,
      );
    }
  }, [debouncedQuery, currentQuery, currentType, router, mediaType]);

  return (
    <>
      <Header
        searchProps={{
          handleChange,
          handleKeyDown,
          handleIconClick: handleSearch,
        }}
        mediaType={mediaType}
        setMediaType={setMediaType}
        isLoggedIn={true}
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
