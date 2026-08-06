import { deleteUserByEmail } from './admin';
import { TEST_USER_EMAIL } from './env';

// Delete the persistent test user after the whole suite.
export default async function globalTeardown() {
  await deleteUserByEmail(TEST_USER_EMAIL);
}
