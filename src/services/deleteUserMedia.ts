'use server';

import { createClient } from '@/lib/supabase/server';

export const deleteUserMedia = async (id: number): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_media')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};
