// Disable static generation to prevent SSR errors with Zustand store
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Hanken_Grotesk, Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ChatWidget } from '@/components/ChatWidget'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const hanken = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})
const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IPOReady — The World\'s Only Central Hub for IPO Readiness',
  description: 'Manage your entire IPO workflow from private issuer to public listing on TSX, TSXV, CSE, NASDAQ, NYSE, or OTC. Checklist, PACE tracking, cap table management, document management, and expert network.',
  keywords: 'IPO, going public, TSXV, TSX, CSE, NASDAQ, NYSE, RTO, listing, securities, compliance, cap table, IPO readiness, IPO timeline, IPO costs',
  authors: [{ name: 'IPOReady', url: 'https://ipoready.com' }],
  creator: 'IPOReady Inc.',
  publisher: 'IPOReady Inc.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    title: 'IPOReady — Mission Control for Your IPO',
    description: 'The world\'s first central hub for managing your entire journey from private to public company.',
    type: 'website',
    url: 'https://ipoready.com',
    siteName: 'IPOReady',
    locale: 'en_US',
    images: [
      {
        url: 'https://ipoready.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IPOReady - Central Hub for IPO Readiness',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPOReady — Mission Control for Your IPO',
    description: 'The world\'s first central hub for managing your entire journey from private to public company.',
    creator: '@IPOReady',
    images: ['https://ipoready.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://ipoready.com',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

// JSON-LD Structured Data for search engines
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IPOReady',
  url: 'https://ipoready.com',
  logo: 'https://ipoready.com/logo.png',
  description: 'The world\'s first central hub for IPO readiness workflow management',
  sameAs: [
    'https://twitter.com/IPOReady',
    'https://linkedin.com/company/ipoready',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@ipoready.com',
  },
  founder: [
    {
      '@type': 'Person',
      name: 'IPOReady Team',
    },
  ],
}

const applicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'IPOReady',
  description: 'IPO Readiness Workflow Management Platform',
  url: 'https://ipoready.com',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: '299',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '147',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${hanken.variable} ${jakartaSans.variable} ${inter.variable}`}>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
        />
        {/* Canonical URL */}
        <link rel="canonical" href="https://ipoready.com" />
        {/* Preconnect to Google APIs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Site Verification (replace with actual token) */}
        <meta name="google-site-verification" content="REPLACE_WITH_YOUR_GSC_TOKEN" />
        {/* Additional SEO meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <Providers>
          {children}
          <ChatWidget />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  )
}
