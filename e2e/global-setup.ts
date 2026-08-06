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
}
