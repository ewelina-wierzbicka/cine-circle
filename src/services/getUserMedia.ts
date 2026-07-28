import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { MediaType, UserMedia, UserMediaPage } from '@/types';

export const getUserMediaList = async (
  watchStatus: 'watched' | 'to_watch',
  page = 0,
  mediaType?: MediaType,
): Promise<UserMediaPage> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('user_media')
    .select(`*, media${mediaType ? '!inner' : ''}(*)`)
    .eq('user_id', user.id)
    .order('watched_date', { ascending: false, nullsFirst: false })
    .order('added_at', { ascending: false })
    .range(from, to);

  if (watchStatus) {
    query = query.eq('watchStatus', watchStatus);
  }

  if (mediaType) {
    query = query.eq('media.media_type', mediaType);
  }

  const { data, error } = await query;

  if (error) throw new Error('Failed to load your media.');

  return {
    media: data as UserMedia[],
    nextPage: data.length === PAGE_SIZE ? page + 1 : null,
  };
};

export const getUserMedia = async (
  tmdbId: number,
  mediaType: MediaType = 'movie',
  knownUserId?: string,
): Promise<UserMedia> => {
  const supabase = await createClient();

  if (!knownUserId) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Not authenticated');
    knownUserId = user.id;
  }

  const { data, error } = await supabase
    .from('user_media')
    .select('*, media!inner(*)')
    .eq('media.tmdb_id', tmdbId)
    .eq('media.media_type', mediaType)
    .eq('user_id', knownUserId)
    .single();

  if (error) {
    const friendly = new Error('Failed to load saved data.');
    Object.assign(friendly, { code: error.code });
    throw friendly;
  }

  return data as UserMedia;
};
