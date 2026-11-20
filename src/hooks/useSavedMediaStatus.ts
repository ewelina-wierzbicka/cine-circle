import { createClient } from '@/lib/supabase/client';
import { MediaType } from '@/types';
import { useQuery } from '@tanstack/react-query';

export type SavedStatus = {
  userMediaId: number;
  watchStatus: 'watched' | 'to_watch';
};

type Row = {
  id: number;
  watchStatus: 'watched' | 'to_watch';
  media: { tmdb_id: number; media_type: MediaType } | null;
};

export const savedKey = (mediaType: MediaType, tmdbId: number) =>
  `${mediaType}-${tmdbId}`;

export const useSavedMediaStatus = (enabled: boolean) =>
  useQuery({
    queryKey: ['user-movies', 'saved-status'],
    enabled,
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_media')
        .select('id, watchStatus, media(tmdb_id, media_type)')
        .returns<Row[]>();
      if (error) throw new Error('Failed to load your saved media.');
      const map = new Map<string, SavedStatus>();
      for (const row of data) {
        if (row.media) {
          map.set(savedKey(row.media.media_type, row.media.tmdb_id), {
            userMediaId: row.id,
            watchStatus: row.watchStatus,
          });
        }
      }
      return map;
    },
  });
