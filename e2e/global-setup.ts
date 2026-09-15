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

  // Storage buckets are not captured in migrations, so a fresh local
  // Supabase lacks the private `avatar` bucket the app uploads to. Mirror
  // the remote project: private bucket, RLS comes from the migrations.
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((b) => b.id === 'avatar')) {
    const { error: bucketError } = await admin.storage.createBucket('avatar', {
      public: false,
    });
    if (bucketError) throw bucketError;
  }
}
