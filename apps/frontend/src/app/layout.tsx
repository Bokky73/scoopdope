import type { Metadata } from 'next';
import './globals.css';
import { WalletButton } from '@/components/wallet/WalletButton';
import NetworkStatus from '@/components/ui/NetworkStatus';
import { TourProvider } from '@/components/ui/TourProvider';
import { BottomMobileNav } from '@/components/layout/MobileNav';
import { Navbar } from '@/components/layout/Navbar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scoopdope.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'scoopdope - Blockchain Education on Stellar',
    template: '%s | scoopdope',
  },
  description:
    'Learn blockchain development with verifiable on-chain credentials powered by the Stellar network.',
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'scoopdope',
    type: 'website',
    title: 'scoopdope - Blockchain Education on Stellar',
    description:
      'Learn blockchain development with verifiable on-chain credentials powered by the Stellar network.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'scoopdope - Blockchain Education on Stellar',
    description:
      'Learn blockchain development with verifiable on-chain credentials powered by the Stellar network.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Skip-to-main link — visible on focus only, for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:dark:bg-gray-900 focus:text-blue-600 focus:dark:text-blue-400 focus:font-semibold focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Skip to main content
        </a>
        <TourProvider>
          <Navbar />
          {/* pb-16 reserves space for the bottom tab bar on mobile */}
          <main id="main-content" className="pb-16 md:pb-0">{children}</main>
          <BottomMobileNav />
        </TourProvider>
        <NetworkStatus />
        <WalletButton />
      </body>
    </html>
  );
}
