import { HomeAbout } from '@/components/HomeAbout';
import { createClient } from '@/lib/supabase/server';

export async function SignedOutAbout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return null;

  return (
    <div data-home-about>
      <HomeAbout />
    </div>
  );
}
