import { NormalizedMedia } from '@/types';
import { useQueries } from '@tanstack/react-query';

async function fetchMediaDetail(
  item: NormalizedMedia,
): Promise<NormalizedMedia> {
  try {
    const endpoint = item.media_type === 'series' ? 'series' : 'movie';
    const res = await fetch(`/api/${endpoint}?id=${item.id}`);
    if (!res.ok) return item;
    const details = await res.json();
    return { ...item, director: details.director };
  } catch {
    return item;
  }
}

type UseMediaDetailsOptions = {
  items: NormalizedMedia[];
  enabled?: boolean;
  staleTime?: number;
};

export function useGetMediaDetails({
  items,
  enabled = true,
  staleTime = 1000 * 60 * 5,
}: UseMediaDetailsOptions) {
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: ['media-detail', item.media_type, item.id],
      queryFn: () => fetchMediaDetail(item),
      enabled,
      staleTime,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    })),
    combine: (results) => ({
      data: results.every((r) => r.data !== undefined)
        ? results.map((r) => r.data as NormalizedMedia)
        : undefined,
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  });

  return queries;
}
