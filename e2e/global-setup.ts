import { admin, deleteUserByEmail } from './admin';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './env';

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

  // Warm up the test server so Turbopack compiles all pages before tests run
  // in parallel. Without this, the first concurrent requests to complex pages
  // (movie detail, search) queue behind auth-page compilations and time out.
  const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
  const warmupPaths = [
    '/login',
    '/search',
    `/movie/27205`, // Inception — used by collection tests
  ];
  await Promise.allSettled(
    warmupPaths.map((p) =>
      fetch(`${baseURL}${p}`, { signal: AbortSignal.timeout(25_000) }),
    ),
  );
}
