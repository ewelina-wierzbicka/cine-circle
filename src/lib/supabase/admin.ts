// ⚠️ NEVER import this file in client-side code. The secret key bypasses RLS.
// Only use this module in server-side code (Server Components, Route Handlers, service functions).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseSecretKey) {
  throw new Error('Missing environment variable: SUPABASE_SECRET_KEY');
}

export const adminSupabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
