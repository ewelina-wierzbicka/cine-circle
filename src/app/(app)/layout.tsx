import { Suspense } from 'react';
import { FooterSlot } from '@/components/FooterSlot';
import Header from '@/components/Header';
import { HeaderSkeleton } from '@/components/HeaderSkeleton';
import ScrollReset from '@/components/ScrollReset';
import { getCurrentUser } from '@/services/getCurrentUser';
import { getProfile } from '@/services/getProfile';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // h-dvh, not h-screen: 100vh on mobile ignores the browser toolbars, so the
  // bottom of `main` — and with it the footer — sits below the visible viewport
  // with no way to scroll to it.
  return (
    <div className="relative h-dvh flex flex-col bg-dark">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full blur-[55px] opacity-35 top-[-30%] left-[-5%] w-[60%] h-[130%] bg-[radial-gradient(#224c78_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-[55px] opacity-25 top-[10%] right-[-10%] w-[50%] h-[80%] bg-[radial-gradient(#755214_0%,transparent_65%)]" />
        <div className="absolute rounded-full blur-2xl bottom-[-20%] left-[30%] w-[40%] h-[80%] bg-[radial-gradient(oklch(82%_0.10_165/0.15)_0%,transparent_65%)]" />
      </div>
      <Suspense fallback={<HeaderSkeleton />}>
        <AuthenticatedHeader />
      </Suspense>
      <Suspense fallback={null}>
        <ScrollReset />
      </Suspense>
      <main className="flex-1 flex flex-col overflow-y-auto bg-dark">
        {children}
        <Suspense fallback={null}>
          <SessionAwareFooter />
        </Suspense>
      </main>
    </div>
  );
}

async function SessionAwareFooter() {
  const user = await getCurrentUser();
  return <FooterSlot signedIn={Boolean(user)} />;
}

async function AuthenticatedHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile() : null;
  return <Header profile={profile} />;
}
