import { PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { MediaType, UserMedia, UserMediaPage } from '@/types';

export const getUserMediaList = async (
  status: 'watched' | 'to_watch',
  page = 0,
  mediaType?: MediaType,
): Promise<UserMediaPage> => {
  const supabase = await createClient();

  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   if (!user) throw new Error('Not authenticated');

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('user_media')
    .select('*, media(*)')
    // .eq('user_id', user.id)
    .order('added_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
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

export const getUserMedia = async (
  tmdbId: number,
  mediaType: MediaType = 'movie',
): Promise<UserMedia> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_media')
    .select('*, media!inner(*)')
    .eq('media.tmdb_id', tmdbId)
    .eq('media.media_type', mediaType)
    .single();

  if (error) throw error;

  return data as UserMedia;
};
