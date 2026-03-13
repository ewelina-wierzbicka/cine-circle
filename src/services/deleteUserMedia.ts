'use server';

import { createClient } from '@/lib/supabase/server';

export const deleteUserMedia = async (id: number): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase.from('user_media').delete().eq('id', id);

  if (error) throw error;
};
