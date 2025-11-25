import type React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Geist } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});
const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sinterklaas Feest - Poem Generator',
  description: 'Generate beautiful Sinterklaas poems with AI',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${geist.className} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
