import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/services/getProfile';

import { ProfileContent } from './ProfileContent';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfile();

  const { count } = await supabase
    .from('user_media')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('watchStatus', 'watched');

  return (
    <ProfileContent
      profile={profile}
      email={user.email ?? ''}
      watchedCount={count ?? 0}
    />
  );
}
