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

  // A Google-only account has no email identity, so it has no password to change.
  // Default to true when identities are unavailable: that is the current behaviour.
  const hasPassword = user?.identities
    ? user.identities.some((identity) => identity.provider === 'email')
    : true;

  return (
    <ProfileContent
      profile={profile}
      email={user?.email ?? ''}
      hasPassword={hasPassword}
    />
  );
}
