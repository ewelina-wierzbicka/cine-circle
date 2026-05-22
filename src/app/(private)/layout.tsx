import Header from '@/components/Header';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col bg-dark">
      <Header />
      <main className="flex-1 overflow-y-auto bg-dark">{children}</main>
    </div>
  );
}
