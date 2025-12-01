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
  title: {
    default: 'Sinterklaas Gedichten Generator - AI Gedichten Maken',
    template: '%s | Sinterklaas Gedichten Generator',
  },
  description:
    'Genereer persoonlijke Sinterklaas gedichten met AI. Maak grappige en hartverwarmende gedichten voor vrienden en familie. Kies tussen klassieke of vrije stijl, pas vriendelijkheid aan, en download als PDF.',
  keywords: [
    'Sinterklaas gedichten',
    'gedichten generator',
    'AI gedichten',
    'Sinterklaas gedicht maken',
    'persoonlijke gedichten',
    'Nederlandse gedichten',
    'Sinterklaas gedicht generator',
    'gedichten voor Sinterklaas',
  ],
  authors: [{ name: 'Sinterklaas Gedichten Generator' }],
  creator: 'Sinterklaas Gedichten Generator',
  publisher: 'Sinterklaas Gedichten Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    'https://www.sinterklaas-poem.nl/'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: '/',
    title: 'Sinterklaas Gedichten Generator - AI Gedichten Maken',
    description:
      'Genereer persoonlijke Sinterklaas gedichten met AI. Maak grappige en hartverwarmende gedichten voor vrienden en familie.',
    siteName: 'Sinterklaas Gedichten Generator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sinterklaas Gedichten Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sinterklaas Gedichten Generator - AI Gedichten Maken',
    description: 'Genereer persoonlijke Sinterklaas gedichten met AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  const siteUrl = 'https://www.sinterklaas-poem.nl';

  return (
    <html lang="nl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Sinterklaas Gedichten Generator',
              description: 'Genereer persoonlijke Sinterklaas gedichten met AI',
              url: siteUrl,
              applicationCategory: 'EntertainmentApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              featureList: [
                'AI-gedichten generatie',
                'Klassieke en vrije stijl',
                'Aanpasbare vriendelijkheid',
                'PDF export',
                'Persoonlijke gedichten',
              ],
              inLanguage: 'nl',
            }),
          }}
        />
      </head>
      <body className={`${geist.className} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Spring naar hoofdinhoud
        </a>
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
