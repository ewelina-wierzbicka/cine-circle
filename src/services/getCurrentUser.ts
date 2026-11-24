import { cookies } from 'next/headers';
import { cache } from 'react';
import { hasAuthCookie } from '@/lib/supabase/authCookie';
import { createClient } from '@/lib/supabase/server';

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  if (!hasAuthCookie(cookieStore.getAll())) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
