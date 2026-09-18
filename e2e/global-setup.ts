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
  // Toast-on-redirect tests only get the 5s the toast lives, so these
  // handlers must already be compiled when the test navigates.
  '/api/auth/confirm-callback',
  '/api/auth/reset-callback',
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
  await warmRoutes(process.env.E2E_BASE_URL ?? 'http://localhost:3001');

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
}
