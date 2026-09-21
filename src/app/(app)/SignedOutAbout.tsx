import { HomeAbout } from '@/components/HomeAbout';
import { createClient } from '@/lib/supabase/server';

// Reads the session, so it must stay inside a Suspense boundary under PPR.
// Signed-in users get an app-shaped home page; the marketing copy renders only
// for signed-out visitors and crawlers, which keeps it crawlable.
export async function SignedOutAbout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return null;

  // `data-home-about` is the hook `page.tsx` keys its `group-has-*` layout off.
  return (
    <div data-home-about>
      <HomeAbout />
    </div>
  );
}
