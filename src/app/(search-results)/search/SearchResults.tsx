'use client';

import Loader from '@/components/Loader';
import MediaList from '@/components/MediaList';
import { toSearchMediaListProps } from '@/lib/mediaUtils';
import { FilterMediaType, NormalizedMedia } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type SearchMediaResponse = { results: NormalizedMedia[]; hasMore: boolean };

const TYPE_LABELS: Record<FilterMediaType, string> = {
  movie: 'movies',
  series: 'series',
  all: 'movies & series',
};

async function fetchMedia({
  pageParam,
  query,
  type,
}: {
  pageParam: number;
  query: string;
  type: FilterMediaType;
}): Promise<SearchMediaResponse> {
  const res = await fetch(
    `/api/search?query=${encodeURIComponent(query)}&page=${pageParam}&type=${type}`,
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch');
  }
  return res.json() as Promise<SearchMediaResponse>;
}

type Props = {
  query: string;
  type: FilterMediaType;
  initialData: SearchMediaResponse | null;
};

export default function SearchResults({ query, type, initialData }: Props) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', query, type],
    queryFn: ({ pageParam }) => fetchMedia({ pageParam, query, type }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialData: initialData
      ? { pages: [initialData], pageParams: [1] }
      : undefined,
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      toast.error((error as Error).message);
    }
  }, [error]);

  const allMedia = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      <MediaList
        media={allMedia.map(toSearchMediaListProps)}
        heading={
          <>
            Search results for:{' '}
            <span className="font-bold">&quot;{query}&quot;</span> (
            {TYPE_LABELS[type]})
          </>
        }
        emptyMessage={`No ${TYPE_LABELS[type]} found for: "${query}"`}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
}
