import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { admin } from './admin';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

// media rows are shared by every user who saved the title, so no app user may
// rewrite one. No browser: supabase-js with the anon key, as the app calls it.

const TMDB_ID = 980_000_000 + Math.floor(Math.random() * 1_000_000);
const PASSWORD = 'MediaRls!1';
let userId: string;
let mediaId: number;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  const email = `media-rls-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@midnightframe.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('createUser failed');
  userId = data.user.id;
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });
  if (signInError) throw signInError;

  const { data: media, error: mediaError } = await admin
    .from('media')
    .insert({ tmdb_id: TMDB_ID, title: 'Original', media_type: 'movie' })
    .select('id')
    .single();
  if (mediaError) throw mediaError;
  mediaId = media.id;
});

test.afterAll(async () => {
  if (userId) await admin.auth.admin.deleteUser(userId);
  if (mediaId) await admin.from('media').delete().eq('id', mediaId);
});

async function storedTitle() {
  const { data } = await admin
    .from('media')
    .select('title')
    .eq('id', mediaId)
    .single();
  return data?.title;
}

test('a signed-in user cannot rewrite a shared media row', async () => {
  await client.from('media').update({ title: 'Defaced' }).eq('id', mediaId);
  expect(await storedTitle()).toBe('Original');
});

test('saving an existing title leaves the shared row untouched', async () => {
  const { error } = await client
    .from('media')
    .upsert(
      { tmdb_id: TMDB_ID, title: 'Defaced', media_type: 'movie' },
      { onConflict: 'tmdb_id,media_type', ignoreDuplicates: true },
    );
  expect(error).toBeNull();
  expect(await storedTitle()).toBe('Original');
});
