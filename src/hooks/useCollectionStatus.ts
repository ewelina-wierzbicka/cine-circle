import { createClient } from '@/lib/supabase/client';
import { MediaType } from '@/types';
import { useQuery } from '@tanstack/react-query';

type CollectionItem = { tmdbId: number; mediaType: MediaType };
type CollectionStatus = {
  userMediaId: number;
  watchStatus: 'watched' | 'to_watch';
};

const fetchCollectionStatus = async (
  items: CollectionItem[],
): Promise<Map<string, CollectionStatus>> => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Not authenticated');

  const tmdbIds = items.map((i) => i.tmdbId);

  const { data, error } = await supabase
    .from('user_media')
    .select('id, watchStatus, media!inner(tmdb_id, media_type)')
    .eq('user_id', user.id)
    .in('media.tmdb_id', tmdbIds);

  if (error) throw error;

  const result = new Map<string, CollectionStatus>();
  for (const row of data) {
    const media = row.media as unknown as {
      tmdb_id: number;
      media_type: MediaType;
    };
    result.set(`${media.tmdb_id}-${media.media_type}`, {
      userMediaId: row.id,
      watchStatus: row.watchStatus as 'watched' | 'to_watch',
    });
  }
  return result;
};

export const useCollectionStatus = (items: CollectionItem[]) => {
  const tmdbIds = items.map((i) => i.tmdbId).sort();

  return useQuery({
    queryKey: ['collection-status', tmdbIds],
    queryFn: () => fetchCollectionStatus(items),
    enabled: items.length > 0,
    staleTime: 1000 * 60 * 2,
  });
};
