import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

/** React `cache` so sibling Suspense boundaries in one request share a single
 * `getUser()` round trip. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
