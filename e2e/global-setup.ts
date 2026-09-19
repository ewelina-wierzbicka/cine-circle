import { admin, deleteUserByEmail } from './admin';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './env';
import { sessionCookiesFor } from './fixtures/session';

// `next dev` compiles a route on its first request. A cold /movie/[id] takes
// ~30s, which blew the per-test timeout before the page ever loaded. Warm the
// routes the suite navigates to so tests only pay for the real work.
const WARM_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  // An AUTH_ROUTE: a logged-in request is redirected to `/` and never
  // compiles the page, so this one must stay anonymous.
  '/registration-confirmed',
  '/search',
  '/movie/27205',
  '/series/1396',
  '/terms',
  '/privacy',
  // Toast-on-redirect tests only get the 5s the toast lives, so these
  // handlers must already be compiled when the test navigates.
  '/api/auth/confirm-callback',
  '/api/auth/reset-callback',
];

// proxy.ts redirects an anonymous request to /login before the page renders,
// so these never compile unless the warm-up carries a session cookie.
const WARM_ROUTES_AUTHED = ['/collection', '/profile', '/reset-password'];

async function warm(baseURL: string, route: string, cookie?: string) {
  try {
    await fetch(new URL(route, baseURL), {
      headers: cookie ? { cookie } : undefined,
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    // A warm-up miss only costs compile time inside the test; never fail here.
  }
}

async function warmRoutes(baseURL: string, cookie: string) {
  await Promise.all([
    ...WARM_ROUTES.map((route) => warm(baseURL, route)),
    ...WARM_ROUTES_AUTHED.map((route) => warm(baseURL, route, cookie)),
  ]);
}

// Create a pre-confirmed persistent test user via the Supabase admin API.
// Runs once before the whole suite.
export default async function globalSetup() {
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

  // Warming the auth-gated routes needs a real session, so it runs after the
  // test user exists.
  const cookies = await sessionCookiesFor(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  const cookie = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  await warmRoutes(process.env.E2E_BASE_URL ?? 'http://localhost:3000', cookie);
}
