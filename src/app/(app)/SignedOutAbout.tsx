import { HomeAbout } from './HomeAbout';
import { getCurrentUser } from '@/services/getCurrentUser';

export async function SignedOutAbout() {
  const user = await getCurrentUser();

  if (user) return null;

  return (
    <div data-home-about>
      <HomeAbout />
    </div>
  );
}
