import type { Metadata, Viewport } from 'next';
import { PwaRegister } from '@/components/PwaRegister';
import { UiAudioBridge } from '@/components/ui/UiAudioBridge';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://openrace.club';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Open Race — 3D Browser Racing Game by Arigatoo Club',
    template: '%s | Open Race',
  },
  description:
    'Experience high-octane 3D browser Formula racing in Open Race by Arigatoo Club. Race against 19 AI opponents across iconic tracks like Monza, Spa, and Buddh Circuit with authentic physics, telemetry, and custom liveries.',
  keywords: [
    'Open Race',
    'Arigatoo Club',
    '3D Racing Game',
    'Browser Racing Game',
    'Formula 1 Simulator',
    'F1 Web Game',
    'WebGL Racing',
    'Three.js Game',
    'React Three Fiber',
    'Pegasus 53',
    'Buddh International Circuit',
    'Monza Circuit',
    'Spa-Francorchamps',
    'Free Online Racing',
    'PWA Racing Game',
  ],
  authors: [{ name: 'Arigatoo Club', url: 'https://openrace.club' }],
  creator: 'Arigatoo Club',
  publisher: 'Arigatoo Club',
  applicationName: 'Open Race',
  generator: 'Next.js',
  category: 'games',
  classification: 'Racing Video Game',
  alternates: {
    canonical: '/',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Open Race',
    title: 'Open Race — 3D Browser Racing Game by Arigatoo Club',
    description:
      'High-octane 3D browser racing with authentic Grand Prix circuits, 20-car grid AI, live telemetry HUD, and custom liveries.',
    images: [
      {
        url: '/og-image.png',
        width: 1440,
        height: 900,
        alt: 'Open Race — 3D Browser Racing Game Showroom & Gameplay',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Race — 3D Browser Racing Game by Arigatoo Club',
    description:
      'Play Open Race: 3D browser racing simulation featuring 6 world championship circuits, 20-car AI grid, and custom liveries.',
    creator: '@arigatooclub',
    site: '@arigatooclub',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Open Race',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['VideoGame', 'WebApplication'],
  name: 'Open Race',
  alternateName: 'Open Race by Arigatoo Club',
  url: siteUrl,
  image: `${siteUrl}/og-image.png`,
  description:
    'A high-octane 3D browser racing simulation game featuring authentic Formula 1 circuits, real-time arcade physics, 20-car AI grid, and custom liveries.',
  genre: ['Racing', 'Simulation', 'Sports', 'Arcade'],
  gamePlatform: ['Web Browser', 'PC', 'Mobile'],
  applicationCategory: 'Game',
  operatingSystem: 'Any',
  playMode: ['SinglePlayer', 'MultiPlayer'],
  author: {
    '@type': 'Organization',
    name: 'Arigatoo Club',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Arigatoo Club',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  inLanguage: 'en',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@600;700;800;900&family=Chakra+Petch:wght@500;700&family=JetBrains+Mono:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <UiAudioBridge />
        <PwaRegister />
      </body>
    </html>
  );
}
