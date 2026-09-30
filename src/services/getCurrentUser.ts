import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

/** React `cache` so sibling Suspense boundaries in one request share a single
 * `getUser()` round trip.
 *
 * The `error` is deliberately not returned. `UserResponse` is a discriminated
 * union: a non-null `error` always pairs with `data.user === null`, so a
 * `!user` check at the call site covers every failure the old
 * `userError || !user` guard covered. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
