import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import { InstallPwaPrompt } from '../components/InstallPwaPrompt';
import { AccessibilityEffects } from '../components/AccessibilityEffects';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'UrbanFlow',
  description:
    'UrbanFlow planifie vos trajets à Lille en temps réel : marche, vélo, trottinette, transports en commun et voiture, pour l’itinéraire le plus rapide et le plus écologique.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={hankenGrotesk.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <InstallPwaPrompt />
          <AccessibilityEffects />
        </Providers>
      </body>
    </html>
  );
}
