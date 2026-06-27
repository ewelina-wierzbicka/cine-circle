import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/services/getProfile';
import { ProfileContent } from './ProfileContent';

export default async function ProfilePage() {
  const profile = await getProfile();

  // getProfile handles auth, but we still need user.email which it doesn't return
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ProfileContent profile={profile} email={user?.email ?? ''} />;
}
