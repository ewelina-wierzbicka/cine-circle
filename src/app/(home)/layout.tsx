import Header from '@/components/Header';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="w-full max-w-content min-h-full-screen mx-auto p-4 flex items-center justify-center flex-col relative">
        {children}
      </div>
    </>
  );
}
