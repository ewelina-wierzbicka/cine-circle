import '@/globals.css';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'CineCircle',
  description: "Let's watch some movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} font-sans antialiased min-h-screen text-primary`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
