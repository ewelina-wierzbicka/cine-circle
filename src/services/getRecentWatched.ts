import { createClient } from '@/lib/supabase/server';
import { getUserMediaList } from '@/services/getUserMedia';
import { TrendingMovie, UserMedia } from '@/types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';
export const RECENT_WATCHED_COUNT = 8;

function toRecentPoster(item: UserMedia): TrendingMovie {
  return {
    title: item.media.title,
    year: (item.media.release_date ?? '').slice(0, 4),
    type: item.media.media_type,
    posterUrl: item.media.poster_path
      ? `${TMDB_IMAGE_BASE}${item.media.poster_path}`
      : undefined,
    id: item.media.tmdb_id,
  };
}

export async function getRecentWatched(): Promise<TrendingMovie[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const result = await getUserMediaList('watched', 0);
    return result.media.slice(0, RECENT_WATCHED_COUNT).map(toRecentPoster);
  } catch {
    return [];
  }
}
