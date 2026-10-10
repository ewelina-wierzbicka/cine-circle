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

type ResolvedRating = Exclude<RatingFilter, 'all'>;

// rating is stored 1..10 in half-star steps, so a star filter doubles
const starsToRating = (stars: Exclude<ResolvedRating, 'unrated'>) =>
  Number(stars) * 2;

const matchesRating = (entry: UserMedia, rating: ResolvedRating) => {
  const value = entry.rating;

  if (rating === 'unrated') return value === null || value === undefined;

  return (
    value !== null && value !== undefined && value >= starsToRating(rating)
  );
};

const fetchUserMediaPage = async ({
  watchStatus,
  page,
  search,
  mediaType,
  rating,
}: {
  watchStatus: 'watched' | 'to_watch';
  page: number;
  search?: string;
  mediaType?: MediaType;
  rating?: ResolvedRating;
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
  if (rating === 'unrated') {
    query = query.is('rating', null);
  } else if (rating) {
    query = query.gte('rating', starsToRating(rating));
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
  rating?: RatingFilter,
) => {
  const isSearch = !!search;
  const resolvedMediaType =
    mediaType === 'all' || !mediaType ? undefined : mediaType;
  const resolvedRating = rating === 'all' || !rating ? undefined : rating;

  const filteredInitialData =
    initialData && (resolvedMediaType || resolvedRating)
      ? {
          ...initialData,
          media: initialData.media.filter(
            (m) =>
              (!resolvedMediaType ||
                m.media.media_type === resolvedMediaType) &&
              (!resolvedRating || matchesRating(m, resolvedRating)),
          ),
        }
      : initialData;

  return useInfiniteQuery({
    queryKey: ['user-movies', watchStatus, search, mediaType, rating],
    queryFn: ({ pageParam }) =>
      fetchUserMediaPage({
        watchStatus,
        page: pageParam,
        search,
        mediaType: resolvedMediaType,
        rating: resolvedRating,
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
