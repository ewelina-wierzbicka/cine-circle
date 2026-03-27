import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { FilterMediaType, MediaType, UserMedia, UserMediaPage } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchUserMediaPage = async ({
  watchStatus,
  page,
  search,
  mediaType,
}: {
  watchStatus: 'watched' | 'to_watch';
  page: number;
  search?: string;
  mediaType?: MediaType;
}): Promise<UserMediaPage> => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Not authenticated');

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('user_media')
    .select(`*, media${search || mediaType ? '!inner' : ''}(*)`)
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })
    .range(from, to);

  if (watchStatus) {
    query = query.eq('watchStatus', watchStatus);
  }

  if (search) {
    query = query.ilike('media.title', `%${search}%`);
  }

  if (mediaType) {
    query = query.eq('media.media_type', mediaType);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    media: data as UserMedia[],
    nextPage: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

const BASE_STALE_TIME = 1000 * 60 * 2;
const SEARCH_STALE_TIME = 1000 * 30;

export const useUserMedia = (
  watchStatus: 'watched' | 'to_watch',
  initialData?: UserMediaPage,
  search?: string,
  mediaType?: FilterMediaType,
) => {
  const isSearch = !!search;
  const resolvedMediaType =
    mediaType === 'all' || !mediaType ? undefined : mediaType;

  const filteredInitialData =
    initialData && resolvedMediaType
      ? {
          ...initialData,
          media: initialData.media.filter(
            (m) => m.media.media_type === resolvedMediaType,
          ),
        }
      : initialData;

  return useInfiniteQuery({
    queryKey: ['user-movies', watchStatus, search, mediaType],
    queryFn: ({ pageParam }) =>
      fetchUserMediaPage({
        watchStatus,
        page: pageParam,
        search,
        mediaType: resolvedMediaType,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData:
      !isSearch && filteredInitialData
        ? { pages: [filteredInitialData], pageParams: [0] }
        : undefined,
    staleTime: isSearch ? SEARCH_STALE_TIME : BASE_STALE_TIME,
  });
};
