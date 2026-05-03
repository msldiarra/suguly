import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://suguly.com'),
  title: {
    default: 'Suguly — E-commerce Bamako | Livraison rapide, Orange Money',
    template: '%s | Suguly',
  },
  description:
    'Achetez électronique, mode, beauté et plus. Livraison rapide à Bamako, paiement Orange Money.',
  keywords: ['e-commerce', 'bamako', 'mali', 'orange money', 'livraison'],
  icons: {
    icon: '/ico.png',
    apple: '/ico.png',
    shortcut: '/ico.png',
  },
  openGraph: {
    siteName: 'Suguly',
    locale: 'fr_FR',
    type: 'website',
  },
  themeColor: '#1A1A1A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Suguly',
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-8V6E22ECKS'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_ID}');
          `}
        </Script>

        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
