import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { admin } from './admin';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

// Access rules, checked against the real local database. No browser: every
// call goes through supabase-js with the anon key, exactly as the browser
// client does, so only RLS and table grants decide the outcome. The
// service-role `admin` client seeds rows and reads back the truth.

type Account = { id: string; email: string; client: SupabaseClient };

const PASSWORD = 'RlsIsolated!1';
const FOREIGN_TMDB_ID = 990_000_000 + Math.floor(Math.random() * 1_000_000);

function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createAccount(label: string): Promise<Account> {
  const email = `rls-${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@midnightframe.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('createUser failed');

  const client = anonClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });
  if (signInError) throw signInError;
  return { id: data.user.id, email, client };
}

let attacker: Account;
let victim: Account;
let victimEntryId: number;
let victimMediaId: number;
const victimAvatar = () => `${victim.id}/avatar.webp`;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  [attacker, victim] = await Promise.all([
    createAccount('attacker'),
    createAccount('victim'),
  ]);

  const { data: media, error: mediaError } = await admin
    .from('media')
    .insert({
      tmdb_id: FOREIGN_TMDB_ID,
      title: 'RLS fixture',
      media_type: 'movie',
    })
    .select('id')
    .single();
  if (mediaError) throw mediaError;
  victimMediaId = media.id;

  const { data: entry, error: entryError } = await admin
    .from('user_media')
    .insert({
      user_id: victim.id,
      media_id: victimMediaId,
      watchStatus: 'watched',
      rating: 8,
      review: 'private note',
    })
    .select('id')
    .single();
  if (entryError) throw entryError;
  victimEntryId = entry.id;

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ user_id: victim.id, display_name: 'Victim' });
  if (profileError) throw profileError;
});

test.afterAll(async () => {
  for (const account of [attacker, victim]) {
    if (!account) continue;
    const { data: objects } = await admin.storage
      .from('avatar')
      .list(account.id);
    if (objects?.length) {
      await admin.storage
        .from('avatar')
        .remove(objects.map((o) => `${account.id}/${o.name}`));
    }
    // user_media and profiles cascade from auth.users.
    await admin.auth.admin.deleteUser(account.id);
  }
  if (victimMediaId) await admin.from('media').delete().eq('id', victimMediaId);
});

async function victimEntry() {
  const { data } = await admin
    .from('user_media')
    .select('rating, review')
    .eq('id', victimEntryId)
    .maybeSingle();
  return data;
}

test.describe('user_media', () => {
  test('another user cannot read it', async () => {
    const { data, error } = await attacker.client
      .from('user_media')
      .select('*')
      .eq('id', victimEntryId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test('the owner can read it, so the check above can fail', async () => {
    const { data } = await victim.client
      .from('user_media')
      .select('id')
      .eq('id', victimEntryId);
    expect(data).toEqual([{ id: victimEntryId }]);
  });

  test('another user cannot update it', async () => {
    await attacker.client
      .from('user_media')
      .update({ rating: 1, review: 'tampered' })
      .eq('id', victimEntryId);
    expect(await victimEntry()).toEqual({ rating: 8, review: 'private note' });
  });

  test('another user cannot delete it', async () => {
    await attacker.client.from('user_media').delete().eq('id', victimEntryId);
    expect(await victimEntry()).not.toBeNull();
  });

  test('another user cannot insert a row on its behalf', async () => {
    const { error } = await attacker.client.from('user_media').insert({
      user_id: victim.id,
      media_id: victimMediaId,
      watchStatus: 'to_watch',
    });
    expect(error?.code).toBe('42501');
  });

  test('a signed-out visitor reads nothing', async () => {
    const { data } = await anonClient().from('user_media').select('id');
    expect(data ?? []).toEqual([]);
  });
});

test.describe('profiles', () => {
  test('another user cannot read it', async () => {
    const { data } = await attacker.client
      .from('profiles')
      .select('*')
      .eq('user_id', victim.id);
    expect(data).toEqual([]);
  });

  test('another user cannot update it', async () => {
    await attacker.client
      .from('profiles')
      .update({ display_name: 'Tampered' })
      .eq('user_id', victim.id);
    const { data } = await admin
      .from('profiles')
      .select('display_name')
      .eq('user_id', victim.id)
      .single();
    expect(data?.display_name).toBe('Victim');
  });

  test('another user cannot create one in its name', async () => {
    const { error } = await attacker.client
      .from('profiles')
      .insert({ user_id: victim.id, display_name: 'Impostor' });
    expect(error).not.toBeNull();
  });
});

// The erasure log must outlive restores and stay out of every client's reach:
// RLS is on with no policy, and the table grants are revoked.
test.describe('deleted_accounts', () => {
  for (const [who, client] of [
    ['a signed-in user', () => attacker.client],
    ['a signed-out visitor', anonClient],
  ] as const) {
    test(`${who} cannot read it`, async () => {
      const { error } = await client().from('deleted_accounts').select('*');
      expect(error?.code).toBe('42501');
    });

    test(`${who} cannot write to it`, async () => {
      const { error } = await client()
        .from('deleted_accounts')
        .insert({ user_id: victim.id });
      expect(error?.code).toBe('42501');
    });
  }
});

// media rows are shared by every user who saved the title. The server writes
// them from TMDB through the service role, so no app user may write one.
test.describe('media', () => {
  async function storedTitle() {
    const { data } = await admin
      .from('media')
      .select('title')
      .eq('id', victimMediaId)
      .single();
    return data?.title;
  }

  test('a signed-in user cannot rewrite a shared row', async () => {
    await attacker.client
      .from('media')
      .update({ title: 'Defaced' })
      .eq('id', victimMediaId);
    expect(await storedTitle()).toBe('RLS fixture');
  });

  test('a signed-in user cannot upsert over a shared row', async () => {
    const { error } = await attacker.client
      .from('media')
      .upsert(
        { tmdb_id: FOREIGN_TMDB_ID, title: 'Defaced', media_type: 'movie' },
        { onConflict: 'tmdb_id,media_type' },
      );
    expect(error?.code).toBe('42501');
    expect(await storedTitle()).toBe('RLS fixture');
  });

  test('a signed-in user cannot plant a new row', async () => {
    const { error } = await attacker.client.from('media').insert({
      tmdb_id: FOREIGN_TMDB_ID + 1,
      title: 'Planted',
      media_type: 'movie',
    });
    expect(error?.code).toBe('42501');
  });
});

test.describe('avatar storage', () => {
  test.beforeAll(async () => {
    const { error } = await admin.storage
      .from('avatar')
      .upload(victimAvatar(), new Blob(['webp'], { type: 'image/webp' }));
    if (error) throw error;
  });

  test('another user cannot download it', async () => {
    const { data, error } = await attacker.client.storage
      .from('avatar')
      .download(victimAvatar());
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  test('the owner can download it, so the check above can fail', async () => {
    const { data } = await victim.client.storage
      .from('avatar')
      .download(victimAvatar());
    expect(data).not.toBeNull();
  });

  test('another user cannot upload into its folder', async () => {
    const { error } = await attacker.client.storage
      .from('avatar')
      .upload(`${victim.id}/planted.webp`, new Blob(['x']), {
        contentType: 'image/webp',
      });
    expect(error).not.toBeNull();
  });

  test('another user cannot remove it', async () => {
    await attacker.client.storage.from('avatar').remove([victimAvatar()]);
    const { data } = await admin.storage.from('avatar').list(victim.id);
    expect(data?.map((o) => o.name)).toContain('avatar.webp');
  });

  test('a signed-out visitor cannot download it', async () => {
    const { data } = await anonClient()
      .storage.from('avatar')
      .download(victimAvatar());
    expect(data).toBeNull();
  });
});
