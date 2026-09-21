import '@/globals.css';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { DM_Mono, DM_Sans, DM_Serif_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo';

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
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'movie tracker',
    'tv tracker',
    'watchlist',
    'film diary',
    'movie ratings',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
