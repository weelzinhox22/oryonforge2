import type { Metadata, Viewport } from 'next';
import './globals.css';
import OnboardingModal from '@/components/OnboardingModal';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'Oryon Forge',
  description: 'Plataforma fitness social - desafios, atividades e ranking entre amigos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Oryon Forge',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-[#F0F0F6] overflow-x-hidden antialiased" suppressHydrationWarning>
        <ScrollToTop />
        {children}
        <OnboardingModal />
        <PWAInstallBanner />
      </body>
    </html>
  );
}
