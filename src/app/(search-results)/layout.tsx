'use client';

import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { useSearch } from '@/hooks/useSearch';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || '';

  const { debouncedQuery, handleChange, handleSearch, handleKeyDown } =
    useSearch({
      onSearch: (query) =>
        router.replace(`/search?query=${encodeURIComponent(query)}`),
      initialQuery,
      debounceMs: 500,
    });

  useEffect(() => {
    if (debouncedQuery) {
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
