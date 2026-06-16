import { NormalizedMedia } from '@/types';
import { useQuery } from '@tanstack/react-query';

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

async function fetchMediaDetails(
  items: NormalizedMedia[],
): Promise<NormalizedMedia[]> {
  return Promise.all(items.map(fetchMediaDetail));
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
  return useQuery({
    queryKey: ['media-details', items.length, ...items.map((i) => i.id)],
    queryFn: () => fetchMediaDetails(items),
    enabled: enabled && items.length > 0,
    staleTime,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
}
