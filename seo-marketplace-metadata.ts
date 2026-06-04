import type { Metadata } from 'next'

/**
 * SEO Metadata for /marketplace
 * Vetted IPO Expert Network — Securities Lawyers, Auditors, Advisors, Board Members
 * Optimized for "IPO lawyers", "securities counsel", "listing experts" keywords
 */

export const marketplaceMetadata: Metadata = {
  title: 'Vetted IPO Expert Network | Lawyers, Auditors, Advisors',
  description:
    'Connect confidentially with vetted securities lawyers, auditors, advisors, and board members. Curated for IPO, RTO, and SPAC listings on TSX, TSXV, NASDAQ, NYSE.',
  keywords: [
    'IPO lawyers',
    'securities counsel',
    'IPO advisors',
    'listing experts',
    'TSXV advisors',
    'audit firms',
    'go-public services',
    'transfer agents',
    'investor relations',
    'independent directors',
    'RTO professionals',
    'SPAC advisors',
    'capital markets',
    'compliance expertise',
    'IPO readiness',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    title: 'Vetted IPO Expert Network | Your Trusted Listing Partners',
    description:
      'Confidently connect with top-rated securities lawyers, auditors, IR firms, and advisors. All professionals verified for public market experience.',
    type: 'website',
    url: 'https://www.ipoready.ai/marketplace',
    siteName: 'IPOReady',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.ipoready.ai/og-marketplace.png',
        width: 1200,
        height: 630,
        alt: 'IPOReady Expert Network - Vetted IPO Professionals',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPO Expert Network | Verified Professionals',
    description:
      'Find securities counsel, auditors, advisors & board members verified for TSX/TSXV/NASDAQ listings.',
    creator: '@IPOReady',
    images: ['https://www.ipoready.ai/og-marketplace.png'],
  },
  alternates: {
    canonical: 'https://www.ipoready.ai/marketplace',
  },
}

/**
 * JSON-LD Structured Data for Marketplace
 * CollectionPage schema for the expert network directory
 * ProfessionalService schema for each category of professionals
 */

export const marketplaceCollectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'IPO Expert Network — Vetted Professionals',
  url: 'https://www.ipoready.ai/marketplace',
  description:
    'Curated network of securities lawyers, auditors, advisors, and board members verified for demonstrated public market experience across TSX, TSXV, CSE, NASDAQ, NYSE, and OTC listings.',
  isPartOf: {
    '@type': 'WebSite',
    '@id': 'https://www.ipoready.ai#website',
  },
  mainEntity: {
    '@type': 'Service',
    name: 'IPO Expert Network',
    description: 'Confidential professional network for IPO, RTO, and SPAC listings',
    url: 'https://www.ipoready.ai/marketplace',
    serviceType: 'IPO Advisory & Professional Services',
    areaServed: [
      {
        '@type': 'Country',
        name: 'Canada',
      },
      {
        '@type': 'Country',
        name: 'United States',
      },
    ],
    availableLanguage: ['en', 'fr'],
    potentialAction: {
      '@type': 'ReserveAction',
      name: 'Inquire Confidentially',
      description: 'Submit a confidential inquiry to a verified professional',
    },
  },
}

/**
 * Professional categories with expertise mapping
 * Use for BreadcrumbList schema on category filters
 */
export const marketplaceProfessionalCategories = [
  {
    name: 'Securities Lawyer',
    emoji: '⚖️',
    expertise: [
      'Prospectus Preparation',
      'NI 41-101 Compliance',
      'Escrow & Lock-Up Agreements',
      'Continuous Disclosure',
      'Material Contracts Review',
    ],
  },
  {
    name: 'Auditor (CPAB)',
    emoji: '📊',
    expertise: [
      'IPO Audit Preparation',
      'IFRS Financial Statements',
      'First-Time Public Company Audits',
      'Canadian Regulatory Compliance',
    ],
  },
  {
    name: 'Auditor (PCAOB+CPAB)',
    emoji: '📊',
    expertise: [
      'IPO Audit Preparation',
      'IFRS Financial Statements',
      'IFRS to US GAAP Conversion',
      'Dual-Listed Issuers',
      'US & Canadian Regulatory Compliance',
    ],
  },
  {
    name: 'Go-Public Advisor',
    emoji: '🚀',
    expertise: [
      'Exchange Application Preparation',
      'IPO Readiness Gap Analysis',
      'Listing Requirement Coordination',
      'CPC & Direct Listing Strategy',
    ],
  },
  {
    name: 'IR Firm',
    emoji: '📣',
    expertise: [
      'Investor Targeting & Roadshow',
      'Continuous Disclosure (NI 51-102)',
      'Shareholder Communications',
      'Press Release Management',
    ],
  },
  {
    name: 'Independent Director',
    emoji: '🏛️',
    expertise: [
      'Audit Committee Leadership',
      'NI 52-110 Compliance',
      'Board-Level Governance',
      'Sector-Specific Board Experience',
    ],
  },
  {
    name: 'Transfer Agent',
    emoji: '🔄',
    expertise: [
      'CDS Connectivity',
      'DRS Capability',
      'Shareholder Registry',
      'SEDI Filing Support',
    ],
  },
]

/**
 * Breadcrumb schema for category navigation
 * Add to marketplace page when filtering by category
 */
export const getMarketplaceBreadcrumbSchema = (currentCategory: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.ipoready.ai',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Expert Network',
      item: 'https://www.ipoready.ai/marketplace',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: currentCategory,
      item: `https://www.ipoready.ai/marketplace?category=${encodeURIComponent(
        currentCategory
      )}`,
    },
  ],
})

/**
 * ProfessionalService schema for individual provider categories
 * Include one of these in the page schema for each category
 */
export const marketplaceProfessionalServiceSchema = (
  category: string,
  exchanges: string[]
) => {
  const categoryMap: Record<
    string,
    { description: string; expertise: string[] }
  > = {
    'Securities Lawyer': {
      description:
        'Vetted securities counsel specializing in prospectus preparation, NI 41-101 compliance, escrow structuring, and continuous disclosure obligations.',
      expertise: [
        'Prospectus Preparation',
        'NI 41-101 Compliance',
        'Escrow & Lock-Up Agreements',
        'Continuous Disclosure',
        'Material Contracts Review',
      ],
    },
    'Auditor (CPAB)': {
      description:
        'CPAB-registered auditors for first-time and seasoned IPO audit cycles.',
      expertise: [
        'IPO Audit Preparation',
        'IFRS Financial Statements',
        'First-Time Public Company Audits',
        'Dual-Listed Issuers',
      ],
    },
    'Auditor (PCAOB+CPAB)': {
      description:
        'Dual-registered (PCAOB+CPAB) auditors for cross-border IPO audit cycles.',
      expertise: [
        'IPO Audit Preparation',
        'IFRS Financial Statements',
        'IFRS to US GAAP Conversion',
        'Dual-Listed Issuers',
        'First-Time Public Company Audits',
      ],
    },
    'Go-Public Advisor': {
      description:
        'End-to-end listing specialists with direct exchange relationships and gap analysis expertise for IPO readiness.',
      expertise: [
        'Exchange Application Preparation',
        'IPO Readiness Gap Analysis',
        'Listing Requirement Coordination',
        'CPC & Direct Listing Strategy',
      ],
    },
    'IR Firm': {
      description:
        'IR specialists for pre-IPO roadshow support and post-listing continuous disclosure compliance.',
      expertise: [
        'Investor Targeting & Roadshow',
        'Continuous Disclosure (NI 51-102)',
        'Shareholder Communications',
        'Press Release Management',
      ],
    },
    'Independent Director': {
      description:
        'Board members and audit committee experts with public market governance experience.',
      expertise: [
        'Audit Committee Leadership',
        'NI 52-110 Compliance',
        'Board-Level Governance',
        'Sector-Specific Board Experience',
      ],
    },
    'Transfer Agent': {
      description:
        'CDS-connected transfer agents for book-entry settlement and shareholder registry management.',
      expertise: [
        'CDS Connectivity',
        'DRS Capability',
        'Shareholder Registry',
        'SEDI Filing Support',
      ],
    },
  }

  const categoryData = categoryMap[category] || {
    description: `Verified ${category} professionals for IPO listings`,
    expertise: [],
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${category} Network`,
    description: categoryData.description,
    serviceType: 'IPO Advisory & Professional Services',
    areaServed: exchanges.map((ex) => ({
      '@type': 'Place',
      name: ex,
    })),
    expertise: categoryData.expertise,
  }
}
