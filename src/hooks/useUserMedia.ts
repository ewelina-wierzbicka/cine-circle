import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { FilterMediaType, MediaType, UserMedia, UserMediaPage } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchUserMediaPage = async ({
  status,
  page,
  search,
  mediaType,
}: {
  status: 'watched' | 'to_watch';
  page: number;
  search?: string;
  mediaType?: MediaType;
}): Promise<UserMediaPage> => {
  const supabase = createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('user_media')
    .select(`*, media${search ? '!inner' : ''}(*)`)
    .order('added_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('media.title', `%${search}%`);
  }

  if (mediaType) {
    query = query.eq('media.media_type', mediaType);
  }

  const { data, error } = await query;

      console.log(mediaType, data, error);

  if (error) throw error;

  return {
    media: data as UserMedia[],
    nextPage: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

const BASE_STALE_TIME = 1000 * 60 * 2;
const SEARCH_STALE_TIME = 1000 * 30;

export const useUserMedia = (
  status: 'watched' | 'to_watch',
  initialData?: UserMediaPage,
  search?: string,
  mediaType?: FilterMediaType,
) => {
  const isSearch = !!search;
  const resolvedMediaType =
    mediaType === 'all' || !mediaType ? undefined : mediaType;

    console.log('res', resolvedMediaType);

  return useInfiniteQuery({
    queryKey: ['user-movies', status, search, mediaType],
    queryFn: ({ pageParam }) =>
      fetchUserMediaPage({
        status,
        page: pageParam,
        search,
        mediaType: resolvedMediaType,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData:
      !isSearch && initialData
        ? { pages: [initialData], pageParams: [0] }
        : undefined,
    staleTime: isSearch ? SEARCH_STALE_TIME : BASE_STALE_TIME,
  });
};
