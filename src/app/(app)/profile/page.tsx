import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Profile',
  robots: { index: false, follow: false },
};

import { getCurrentUser } from '@/services/getCurrentUser';
import { getProfile } from '@/services/getProfile';
import { ProfileContent } from './ProfileContent';

export default async function ProfilePage() {
  const profile = await getProfile();
  const user = await getCurrentUser();

  return <ProfileContent profile={profile} email={user?.email ?? ''} />;
}
