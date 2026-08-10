import { admin } from '../admin';

// Seed helpers for collection tests. Uses the service-role admin client so it
// writes user_media rows directly, bypassing RLS. The FK cascade migration
// deletes these rows when the isolated user is deleted in teardown.

type SeedMedia = {
  tmdbId: number;
  title: string;
  mediaType?: 'movie' | 'series';
  posterPath?: string | null;
  releaseDate?: string | null;
};

type SeedEntry = SeedMedia & {
  watchStatus: 'to_watch' | 'watched';
  rating?: number;
  watchedDate?: string;
  review?: string;
};

async function upsertMedia(m: SeedMedia): Promise<number> {
  const { data, error } = await admin
    .from('media')
    .upsert(
      {
        tmdb_id: m.tmdbId,
        title: m.title,
        media_type: m.mediaType ?? 'movie',
        poster_path: m.posterPath ?? null,
        release_date: m.releaseDate ?? null,
      },
      { onConflict: 'tmdb_id,media_type' },
    )
    .select('id')
    .single();
  if (error) throw error;
  return data.id as number;
}

export async function seedUserMedia(
  userId: string,
  entry: SeedEntry,
): Promise<void> {
  const mediaId = await upsertMedia(entry);
  const { error } = await admin.from('user_media').insert({
    user_id: userId,
    media_id: mediaId,
    watchStatus: entry.watchStatus,
    watched_date: entry.watchedDate ?? null,
    rating: entry.rating ?? null,
    review: entry.review ?? null,
  });
  if (error) throw error;
}
