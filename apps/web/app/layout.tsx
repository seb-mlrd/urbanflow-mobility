import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import { InstallPwaPrompt } from '../components/InstallPwaPrompt';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'UrbanFlow',
  description: 'Mobilité urbaine intelligente',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
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
    <html lang="fr" className={hankenGrotesk.variable}>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <InstallPwaPrompt />
        </Providers>
      </body>
    </html>
  );
}
