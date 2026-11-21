import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { admin } from './admin';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

// media rows are shared by every user who saved the title, so no app user may
// write one. The server saves them from TMDB through the service role.
// No browser: supabase-js with the anon key, as the app calls it.

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

test('a signed-in user cannot upsert over a shared media row', async () => {
  const { error } = await client
    .from('media')
    .upsert(
      { tmdb_id: TMDB_ID, title: 'Defaced', media_type: 'movie' },
      { onConflict: 'tmdb_id,media_type' },
    );
  expect(error?.code).toBe('42501');
  expect(await storedTitle()).toBe('Original');
});

test('a signed-in user cannot plant a new media row', async () => {
  const { error } = await client
    .from('media')
    .insert({ tmdb_id: TMDB_ID + 1, title: 'Planted', media_type: 'movie' });
  expect(error?.code).toBe('42501');
});
