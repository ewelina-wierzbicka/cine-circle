import { getProfile } from '@/services/getProfile';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!profile || !user) return null;

  return (
    <div className="relative max-w-lg mx-auto px-6 py-12 animate-fade-up">
      <h1 className="font-serif text-4xl mb-8">Profile</h1>
      <ProfileForm profile={profile} email={user.email ?? ''} />
    </div>
  );
}
