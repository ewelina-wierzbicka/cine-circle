import '@/globals.css';
import { Providers } from '@/providers';
import { RouteProgressProvider } from '@/components/RouteProgress';
import type { Metadata } from 'next';
import { DM_Mono, DM_Sans, DM_Serif_Display } from 'next/font/google';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif-display',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
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
        className={`${dmSans.variable} ${dmSerifDisplay.variable} ${dmMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <RouteProgressProvider>{children}</RouteProgressProvider>
        </Providers>
      </body>
    </html>
  );
}
