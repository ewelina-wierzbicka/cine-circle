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

  // The `avatar` bucket now ships in a migration
  // (20260917143659_add_avatar_bucket.sql), so tests no longer create it.
  // Fail loudly instead: a missing or public bucket means the local database
  // is behind, and every avatar test would otherwise fail with an opaque
  // storage error.
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
