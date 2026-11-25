import { admin, deleteUserByEmail } from './admin';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './env';

// `next dev` compiles a route on its first request. A cold /movie/[id] takes
// ~30s, which blew the per-test timeout before the page ever loaded. Warm the
// routes the suite navigates to so tests only pay for the real work.
const WARM_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/search',
  '/movie/27205',
  '/series/214582',
  // Toast-on-redirect tests only get the 5s the toast lives, so these
  // handlers must already be compiled when the test navigates.
  '/api/auth/confirm-callback',
  '/api/auth/reset-callback',
  '/api/auth/oauth-callback',
];

async function warmRoutes(baseURL: string) {
  for (const route of WARM_ROUTES) {
    try {
      await fetch(new URL(route, baseURL), {
        signal: AbortSignal.timeout(180_000),
      });
    } catch {
      // A warm-up miss only costs compile time inside the test; never fail here.
    }
  }
}

// Create a pre-confirmed persistent test user via the Supabase admin API.
// Runs once before the whole suite.
export default async function globalSetup() {
  await warmRoutes(process.env.E2E_BASE_URL ?? 'http://localhost:3000');

  await deleteUserByEmail(TEST_USER_EMAIL); // ensure clean slate
  const { error } = await admin.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;

  const { data: buckets, error: bucketsError } =
    await admin.storage.listBuckets();
  if (bucketsError) throw bucketsError;

  const avatarBucket = buckets?.find((b) => b.id === 'avatar');
  if (!avatarBucket) {
    throw new Error(
      'Storage bucket `avatar` is missing. Run `npx supabase db reset` to apply migrations.',
    );
  }
  if (avatarBucket.public) {
    throw new Error(
      'Storage bucket `avatar` must be private; the app serves avatars via signed URLs.',
    );
  }

  await assertUploadsWork();
}

// A storage-api container left over from an older CLI runs its upsert against a
// schema a newer `db reset` has already moved past, and every upload answers
// `500 DatabaseError code: 42P10`. Probe it once here so the cause is named,
// instead of three avatar tests failing on an opaque 500.
async function assertUploadsWork() {
  const path = `__setup-probe/${crypto.randomUUID()}.webp`;
  const { error } = await admin.storage
    .from('avatar')
    .upload(path, new Blob([new Uint8Array(16)], { type: 'image/webp' }), {
      contentType: 'image/webp',
    });

  if (error) {
    throw new Error(
      `Storage upload is broken on this stack: ${error.message}. The local ` +
        'service containers and the database schema come from different ' +
        'Supabase CLI versions. Run `npx supabase stop && npx supabase start ' +
        '&& npx supabase db reset`, and use one CLI major per checkout.',
    );
  }

  await admin.storage.from('avatar').remove([path]);
}
