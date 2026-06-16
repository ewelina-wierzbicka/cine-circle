import { FilterMediaType, NormalizedMedia } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export type SearchMediaResponse = {
  results: NormalizedMedia[];
  hasMore: boolean;
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
    throw new Error(errorData?.error || 'Search failed');
  }
  return res.json();
}

type UseSearchMediaOptions = {
  query: string;
  type: FilterMediaType;
  enabled?: boolean;
  staleTime?: number;
  initialData?: SearchMediaResponse | null;
};

export function useGetMedia({
  query,
  type,
  enabled = true,
  staleTime = 1000 * 60 * 5,
  initialData,
}: UseSearchMediaOptions) {
  return useInfiniteQuery({
    queryKey: ['search', query, type],
    queryFn: ({ pageParam }) => fetchMedia({ pageParam, query, type }),
    enabled: enabled && query.trim().length > 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    initialData: initialData
      ? { pages: [initialData], pageParams: [1] }
      : undefined,
    staleTime,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
}
