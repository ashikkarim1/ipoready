import type { Metadata } from 'next'

/**
 * SEO Metadata for /pricing
 * IPO Readiness Pricing — Plans for Every Stage
 * Optimized for "IPO pricing", "IPO costs", "listing costs" keywords
 */

export const pricingMetadata: Metadata = {
  title: 'IPO Readiness Pricing | Plans for Every Stage',
  description:
    'Transparent pricing for IPO readiness tools. From Scout (free) to Enterprise. Scale as you grow from pre-IPO to post-listing compliance.',
  keywords: [
    'IPO pricing',
    'IPO cost calculator',
    'listing costs',
    'RTO pricing',
    'SPAC costs',
    'cap table management cost',
    'IPO checklist pricing',
    'document management',
    'compliance costs',
    'IPO software pricing',
    'subscription plans',
    'enterprise IPO solutions',
    'financial planning tools',
    'capital markets costs',
    'public company expenses',
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
    title: 'Simple, Transparent IPO Pricing | Scale with Your Growth',
    description:
      'Flexible pricing plans designed for pre-IPO companies. Manage readiness, costs, and compliance at every stage.',
    type: 'website',
    url: 'https://www.ipoready.ai/pricing',
    siteName: 'IPOReady',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.ipoready.ai/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'IPOReady Pricing Plans - Affordable at Every IPO Stage',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPO Pricing Plans | Affordable at Every Stage',
    description:
      'Start free. Scale as you approach listing. No surprises, no hidden fees.',
    creator: '@IPOReady',
    images: ['https://www.ipoready.ai/og-pricing.png'],
  },
  alternates: {
    canonical: 'https://www.ipoready.ai/pricing',
  },
}

/**
 * Pricing plans structure for schema.org Offer
 * Matches actual pricing page tiers
 */
export const pricingPlans = [
  {
    id: 'scout',
    name: 'Scout',
    price: 0,
    currency: 'USD',
    period: 'Forever Free',
    description:
      'Free tier with IPO readiness checklist, PACE scoring, and basic resources',
    features: [
      'IPO Readiness Checklist',
      'PACE™ Scoring',
      'Basic Document Library',
      'Regulatory Resource Hub',
      'Email Support',
    ],
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: 299,
    currency: 'USD',
    period: 'Monthly',
    annualPrice: 2990,
    description:
      'Monthly subscription with checklist, PACE tracking, cap table, and document management',
    features: [
      'Everything in Scout, plus:',
      'Cap Table Management',
      'Document Upload & Organization',
      'Financial Timeline Planning',
      'Team Collaboration (3 seats)',
      'Foundational PACE Deep Dive',
      'Priority Email Support',
    ],
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    price: 2990,
    currency: 'USD',
    period: 'Annual',
    description:
      'Annual plan with cost calculator, financial modeling, and limited expert network access',
    features: [
      'Everything in Explorer, plus:',
      'IPO Cost Calculator',
      'Financial Modeling Tools',
      'Expert Network Access (Limited)',
      'PACE Accuracy Scoring',
      'Custom Roadmap Generation',
      'Team Collaboration (10 seats)',
      'Phone & Priority Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    currency: 'USD',
    period: 'Custom',
    description:
      'Custom solution with API access, white-label options, and dedicated support',
    features: [
      'Everything in Pathfinder, plus:',
      'Full Expert Network Access',
      'White-Label Options',
      'API Access & Integrations',
      'Custom Reporting',
      'Dedicated Account Manager',
      'Unlimited Team Seats',
      'HIPAA & SOC 2 Compliance',
      'SLA Guarantees',
    ],
  },
]

/**
 * JSON-LD PricingPage Schema
 * Include this in the pricing page <head>
 */
export const pricingPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'IPO Readiness Pricing',
  url: 'https://www.ipoready.ai/pricing',
  description:
    'Transparent, scalable pricing for IPO readiness tools, cap table management, document management, and expert network access.',
  mainEntity: {
    '@type': 'Service',
    name: 'IPOReady Platform',
    description: 'Central hub for IPO readiness management',
    url: 'https://www.ipoready.ai',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '147',
    },
    offers: [
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '0',
        pricingModel: 'FREE_TRIAL',
        name: 'Scout Plan',
        description:
          'Free tier with IPO readiness checklist, PACE scoring, and basic resources',
        availability: 'https://schema.org/InStock',
        url: 'https://www.ipoready.ai/pricing#scout',
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '299',
        priceValidUntil: '2027-12-31',
        pricingModel: 'SUBSCRIPTION_MONTHLY',
        name: 'Explorer Plan',
        description:
          'Monthly subscription with checklist, PACE tracking, cap table, and document management',
        availability: 'https://schema.org/InStock',
        url: 'https://www.ipoready.ai/pricing#explorer',
        billingDuration: 'P1M',
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '2990',
        priceValidUntil: '2027-12-31',
        pricingModel: 'SUBSCRIPTION_ANNUAL',
        name: 'Pathfinder Plan',
        description:
          'Annual plan with cost calculator, financial modeling, and limited expert network access',
        availability: 'https://schema.org/InStock',
        url: 'https://www.ipoready.ai/pricing#pathfinder',
        billingDuration: 'P1Y',
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        pricingModel: 'SUBSCRIPTION_ENTERPRISE',
        name: 'Enterprise Plan',
        description:
          'Custom solution with API access, white-label options, and dedicated support',
        availability: 'https://schema.org/InStock',
        url: 'https://www.ipoready.ai/pricing#enterprise',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          price: 'Contact for pricing',
        },
      },
    ],
  },
}

/**
 * JSON-LD FAQPage Schema for /pricing
 * Rich snippet displays as expandable Q&A in search results
 * All questions target common IPO pricing & cost concerns
 */
export const pricingFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is IPOReady pricing based on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "IPOReady pricing scales with your company's readiness stage. Pricing is based on features you need (PACE tracking, cap table, financial modeling), not on transaction value or capital raised. This ensures early-stage explorers pay less than companies approaching listing.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I start free and upgrade later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our Scout plan is permanently free and includes PACE readiness scoring, IPO checklist, and resource library. You can upgrade to Explorer, Pathfinder, or Enterprise at any time as your needs evolve. Upgrades are prorated.',
      },
    },
    {
      '@type': 'Question',
      name: "What's included in the Expert Network?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Expert Network (included in Pathfinder and higher) gives you confidential access to vetted securities lawyers, auditors, IR firms, advisors, independent directors, and transfer agents. IPOReady charges a referral fee only when you confirm an engagement—no cost to browse or inquire.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does pricing change if we expand internationally (US, UK listings)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IPOReady supports Canadian (TSX/TSXV/CSE), US (NASDAQ/NYSE/OTC), and emerging UK/HK listings. Pricing remains the same regardless of exchange. Regulatory jurisdictions (Ontario, SEC, FCA, etc.) are included in all plans.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you charge for financial modeling or cost calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Cost Calculator and IPO financial modeling tools are included in Pathfinder and higher plans. These tools help you estimate legal, accounting, audit, underwriting, and regulatory costs. No hidden fees per calculation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens to my data if I downgrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your cap table, documents, checklist progress, and PACE score remain in your account indefinitely. If you downgrade from Pathfinder to Explorer, you retain read-only access to advanced features. Data is never deleted.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a contract or long-term commitment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Explorer and Pathfinder are month-to-month subscriptions with no long-term lock-in. Enterprise plans may involve custom agreements depending on scope. You can cancel anytime on monthly plans, with refunds prorated to your cancellation date.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does an IPO actually cost vs. what IPOReady charges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "IPOReady's pricing covers only our platform and tools. Total IPO costs (legal, accounting, underwriting, regulatory, marketing) typically range from $500K–$5M depending on exchange and size. Our Cost Calculator estimates these. We charge separately only for expert referrals once confirmed.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add team members to my account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Explorer includes up to 3 team seats. Pathfinder includes 10 seats. Enterprise includes unlimited team access. Additional seats are $49/month on Explorer and $99/month on Pathfinder.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept Stripe-supported payment methods: credit cards (Visa, Mastercard, Amex), ACH transfers, and wire transfers for Enterprise customers. Invoicing available for Enterprise accounts.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer discounts for non-profits or government-backed issuers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We evaluate case-by-case for non-profit issuers, credit unions, and government-backed entities. Contact support@ipoready.ai for a custom quote.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your refund policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Monthly subscriptions can be cancelled anytime. You'll receive a prorated refund for unused days. Enterprise contracts may have different terms—review your agreement or contact support@ipoready.ai.",
      },
    },
  ],
}

/**
 * Breadcrumb schema for pricing page navigation
 */
export const pricingBreadcrumbSchema = {
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
      name: 'Pricing',
      item: 'https://www.ipoready.ai/pricing',
    },
  ],
}

/**
 * Comparison Table Schema (optional)
 * Include if pricing page has a features comparison table
 */
export const pricingComparisonTableSchema = {
  '@context': 'https://schema.org',
  '@type': 'Table',
  about: 'IPOReady Pricing Plans Comparison',
  url: 'https://www.ipoready.ai/pricing',
}

/**
 * Helper function to generate Offer schema for a specific plan
 * Use when rendering individual pricing cards
 */
export const getPricingPlanOfferSchema = (plan: (typeof pricingPlans)[0]) => {
  const baseOffer = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: `${plan.name} Plan`,
    description: plan.description,
    url: `https://www.ipoready.ai/pricing#${plan.id}`,
    priceCurrency: plan.currency,
    availability: 'https://schema.org/InStock',
  }

  if (plan.price === 0) {
    return {
      ...baseOffer,
      price: '0',
      pricingModel: 'FREE_TRIAL',
      areaServed: {
        '@type': 'Country',
        name: 'US',
      },
    }
  }

  if (plan.price === null) {
    return {
      ...baseOffer,
      pricingModel: 'SUBSCRIPTION_ENTERPRISE',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: plan.currency,
        price: 'Custom',
      },
    }
  }

  return {
    ...baseOffer,
    price: plan.price.toString(),
    pricingModel:
      plan.period === 'Monthly' ? 'SUBSCRIPTION_MONTHLY' : 'SUBSCRIPTION_ANNUAL',
    priceValidUntil: '2027-12-31',
    ...(plan.period === 'Monthly' && {
      billingDuration: 'P1M',
    }),
    ...(plan.period === 'Annual' && {
      billingDuration: 'P1Y',
    }),
  }
}
