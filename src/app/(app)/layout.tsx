import Header from '@/components/Header';
import ScrollReset from '@/components/ScrollReset';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/services/getProfile';

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile() : null;

  return (
    <div className="relative h-screen flex flex-col bg-dark">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full blur-[55px] opacity-35 top-[-30%] left-[-5%] w-[60%] h-[130%] bg-[radial-gradient(#224c78_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-[55px] opacity-25 top-[10%] right-[-10%] w-[50%] h-[80%] bg-[radial-gradient(#755214_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-2xl bottom-[-20%] left-[30%] w-[40%] h-[80%] bg-[radial-gradient(oklch(82%_0.10_165/0.15)_0%,transparent_65%)]" />
      </div>
      <Header profile={profile} />
      <ScrollReset />
      <main className="flex-1 overflow-y-auto bg-dark">{children}</main>
    </div>
  );
}
