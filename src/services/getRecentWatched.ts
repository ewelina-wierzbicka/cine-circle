import { getCurrentUser } from '@/services/getCurrentUser';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { getUserMediaList } from '@/services/getUserMedia';
import { TrendingMovie, UserMedia } from '@/types';

export const RECENT_WATCHED_COUNT = 8;

function toRecentPoster(item: UserMedia): TrendingMovie {
  return {
    title: item.media.title,
    year: (item.media.release_date ?? '').slice(0, 4),
    type: item.media.media_type,
    posterUrl: item.media.poster_path
      ? tmdbImageUrl(item.media.poster_path)
      : undefined,
    id: item.media.tmdb_id,
  };
}

export async function getRecentWatched(): Promise<TrendingMovie[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const result = await getUserMediaList('watched', 0);
    return result.media.slice(0, RECENT_WATCHED_COUNT).map(toRecentPoster);
  } catch {
    return [];
  }
}
