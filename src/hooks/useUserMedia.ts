import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import {
  FilterMediaType,
  MediaType,
  RatingFilter,
  UserMedia,
  UserMediaPage,
} from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

const NO_RATINGS: RatingFilter = [];

// The array identity changes on every render, so the key is a sorted string.
const toRatingKey = (ratings: RatingFilter) =>
  [...ratings].sort((a, b) => a - b).join(',');

const fetchUserMediaPage = async ({
  watchStatus,
  page,
  search,
  mediaType,
  ratings,
}: {
  watchStatus: 'watched' | 'to_watch';
  page: number;
  search?: string;
  mediaType?: MediaType;
  ratings: RatingFilter;
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
    .order('watched_date', { ascending: false, nullsFirst: false })
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

  // rating lives on user_media, so this needs no join change
  if (ratings.length) {
    query = query.in('rating', ratings);
  }

  const { data, error } = await query;

  if (error) throw new Error('Failed to load your media.');

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
  rating: RatingFilter = NO_RATINGS,
) => {
  const isSearch = !!search;
  const resolvedMediaType =
    mediaType === 'all' || !mediaType ? undefined : mediaType;
  const ratingKey = toRatingKey(rating);

  // initialData is the unfiltered first page, so seeding it under a filtered
  // key would truncate the result set. Same rule as the media type filter.
  const canSeedInitialData = !isSearch && !resolvedMediaType && !rating.length;

  return useInfiniteQuery({
    queryKey: [
      'user-movies',
      watchStatus,
      search,
      resolvedMediaType,
      ratingKey,
    ],
    queryFn: ({ pageParam }) =>
      fetchUserMediaPage({
        watchStatus,
        page: pageParam,
        search,
        mediaType: resolvedMediaType,
        ratings: rating,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData:
      canSeedInitialData && initialData
        ? { pages: [initialData], pageParams: [0] }
        : undefined,
    staleTime: isSearch ? SEARCH_STALE_TIME : BASE_STALE_TIME,
  });
};
