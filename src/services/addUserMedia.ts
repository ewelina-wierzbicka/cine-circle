'use server';

import { adminSupabase } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getCurrentUser } from '@/services/getCurrentUser';
import { userMediaColumns } from '@/lib/userMediaColumns';
import { NormalizedMedia, UserEntry } from '@/types';

export const addUserMedia = async (
  { id: tmdb_id, media_type }: Pick<NormalizedMedia, 'id' | 'media_type'>,
  userEntry: UserEntry,
) => {
  const supabase = await createClient();

  const user = await getCurrentUser();

  if (!user) throw new Error('Not authenticated');

  const columns = userMediaColumns(userEntry);

  const tmdb = await (
    media_type === 'series'
      ? getSeriesDetails(String(tmdb_id))
      : getMovieDetails(String(tmdb_id))
  ).catch(() => null);
  if (!tmdb) throw new Error('Failed to save. Please try again.');

  const { data: media, error: mediaError } = await adminSupabase
    .from('media')
    .upsert(
      {
        tmdb_id,
        media_type,
        title: tmdb.title,
        release_date: tmdb.release_date,
        last_air_date: tmdb.last_air_date,
        poster_path: tmdb.poster_path,
      },
      { onConflict: 'tmdb_id,media_type' },
    )
    .select('id')
    .single();

  if (mediaError) throw new Error('Failed to save. Please try again.');

  const { data: existingEntry, error: checkError } = await supabase
    .from('user_media')
    .select('id')
    .eq('user_id', user.id)
    .eq('media_id', media.id)
    .maybeSingle();

  if (checkError) throw new Error('Failed to save. Please try again.');

  if (existingEntry) {
    if (columns.watchStatus !== 'watched')
      return { status: 'duplicate' as const };
    const { error: updateError } = await supabase
      .from('user_media')
      .update(columns)
      .eq('id', existingEntry.id)
      .eq('user_id', user.id);
    if (updateError) throw new Error('Failed to save. Please try again.');
    return { status: 'inserted' as const };
  }

  const { error: entryError } = await supabase.from('user_media').insert({
    user_id: user.id,
    media_id: media.id,
    ...columns,
  });
  if (entryError) throw new Error('Failed to save. Please try again.');

  return { status: 'inserted' as const };
};

export const updateUserMedia = async (
  id: number,
  entry: UserEntry,
): Promise<void> => {
  const supabase = await createClient();

  const user = await getCurrentUser();

  if (!user) throw new Error('Not authenticated');

  const columns = userMediaColumns(entry);

  const { error } = await supabase
    .from('user_media')
    .update(columns)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error('Failed to save changes. Please try again.');
};
