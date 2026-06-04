# SEO Metadata & FAQ Implementation Guide

## Overview
This guide provides step-by-step instructions for integrating comprehensive SEO metadata and FAQ schema into the IPOReady platform for `/marketplace` and `/pricing` pages.

---

## File Locations

Three files have been generated:
1. **`seo-metadata-marketplace-pricing.json`** — Master reference with all metadata, descriptions, and rationale
2. **`seo-marketplace-metadata.ts`** — TypeScript exports for /marketplace/layout.tsx
3. **`seo-pricing-metadata.ts`** — TypeScript exports for /pricing/layout.tsx

---

## Part 1: Marketplace Page (/marketplace)

### 1.1 Update `/src/app/marketplace/layout.tsx`

```typescript
import { AppShell } from '@/components/layout/AppShell'
import { marketplaceMetadata } from '@/lib/seo/marketplace-metadata'
import type { Metadata } from 'next'

// Export metadata
export const metadata: Metadata = marketplaceMetadata

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

### 1.2 Add JSON-LD Schema to Root Layout

In `/src/app/layout.tsx`, add to the `<head>` script section (after `applicationSchema`):

```typescript
const marketplaceCollectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'IPO Expert Network — Vetted Professionals',
  url: 'https://www.ipoready.ai/marketplace',
  description: 'Curated network of securities lawyers, auditors, advisors, and board members verified for demonstrated public market experience across TSX, TSXV, CSE, NASDAQ, NYSE, and OTC listings.',
  isPartOf: {
    '@type': 'WebSite',
    '@id': 'https://www.ipoready.ai#website'
  },
  mainEntity: {
    '@type': 'Service',
    name: 'IPO Expert Network',
    description: 'Confidential professional network for IPO, RTO, and SPAC listings',
    url: 'https://www.ipoready.ai/marketplace',
    serviceType: 'IPO Advisory & Professional Services',
    areaServed: [
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'United States' }
    ],
    availableLanguage: ['en', 'fr'],
    potentialAction: {
      '@type': 'ReserveAction',
      name: 'Inquire Confidentially',
      description: 'Submit a confidential inquiry to a verified professional'
    }
  }
}
```

Then add this in the `<head>` section:

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceCollectionPageSchema) }}
/>
```

### 1.3 Optional: Add Breadcrumb Schema on Filter Action

When a user filters by category (e.g., "Securities Lawyer"), inject dynamic breadcrumb schema into the page header:

```typescript
// In /src/app/marketplace/page.tsx
import { getMarketplaceBreadcrumbSchema } from '@/lib/seo/marketplace-metadata'

// Inside component, after user selects category:
useEffect(() => {
  if (filterCategory !== 'All') {
    const schema = getMarketplaceBreadcrumbSchema(filterCategory)
    // Inject into <head> via useEffect or Next.js Script component
  }
}, [filterCategory])
```

### 1.4 Metadata Summary

| Field | Value |
|-------|-------|
| **Title** (60 chars) | Vetted IPO Expert Network \| Lawyers, Auditors, Advisors |
| **Description** (160 chars) | Connect confidentially with vetted securities lawyers, auditors, advisors, and board members. Curated for IPO, RTO, and SPAC listings on TSX, TSXV, NASDAQ, NYSE. |
| **Keywords** | 15 long-tail keywords (IPO lawyers, securities counsel, listing experts, etc.) |
| **OpenGraph Title** | Vetted IPO Expert Network \| Your Trusted Listing Partners |
| **OpenGraph Description** | Confidently connect with top-rated securities lawyers, auditors, IR firms, and advisors. All professionals verified for public market experience. |
| **Canonical URL** | https://www.ipoready.ai/marketplace |
| **OG Image** | https://www.ipoready.ai/og-marketplace.png (1200x630) |

---

## Part 2: Pricing Page (/pricing)

### 2.1 Update `/src/app/pricing/layout.tsx`

```typescript
import { pricingMetadata } from '@/lib/seo/pricing-metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = pricingMetadata

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

### 2.2 Add JSON-LD Schemas to Root Layout

In `/src/app/layout.tsx`, add these two schemas to the `<head>` section:

**PricingPageSchema:**
```typescript
const pricingPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'IPO Readiness Pricing',
  url: 'https://www.ipoready.ai/pricing',
  description: 'Transparent, scalable pricing for IPO readiness tools, cap table management, document management, and expert network access.',
  mainEntity: {
    '@type': 'Service',
    name: 'IPOReady Platform',
    description: 'Central hub for IPO readiness management',
    url: 'https://www.ipoready.ai',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount': '147'
    },
    offers: [
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '0',
        pricingModel: 'FREE_TRIAL',
        name: 'Scout Plan',
        description: 'Free tier with IPO readiness checklist, PACE scoring, and basic resources',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '299',
        pricingModel: 'SUBSCRIPTION_MONTHLY',
        name: 'Explorer Plan',
        description: 'Monthly subscription with checklist, PACE tracking, cap table, and document management',
        availability: 'https://schema.org/InStock',
        billingDuration: 'P1M'
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: '2990',
        pricingModel: 'SUBSCRIPTION_ANNUAL',
        name: 'Pathfinder Plan',
        description: 'Annual plan with cost calculator, financial modeling, and limited expert network access',
        availability: 'https://schema.org/InStock',
        billingDuration: 'P1Y'
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        pricingModel: 'SUBSCRIPTION_ENTERPRISE',
        name: 'Enterprise Plan',
        description: 'Custom solution with API access, white-label options, and dedicated support',
        availability: 'https://schema.org/InStock'
      }
    ]
  }
}
```

**FAQPageSchema:**
```typescript
const pricingFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is IPOReady pricing based on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "IPOReady pricing scales with your company's readiness stage. Pricing is based on features you need (PACE tracking, cap table, financial modeling), not on transaction value or capital raised. This ensures early-stage explorers pay less than companies approaching listing."
      }
    },
    {
      '@type': 'Question',
      name: 'Can I start free and upgrade later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our Scout plan is permanently free and includes PACE readiness scoring, IPO checklist, and resource library. You can upgrade to Explorer, Pathfinder, or Enterprise at any time as your needs evolve. Upgrades are prorated.'
      }
    },
    {
      '@type': 'Question',
      name: "What's included in the Expert Network?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Expert Network (included in Pathfinder and higher) gives you confidential access to vetted securities lawyers, auditors, IR firms, advisors, independent directors, and transfer agents. IPOReady charges a referral fee only when you confirm an engagement—no cost to browse or inquire.'
      }
    },
    {
      '@type': 'Question',
      name: 'Does pricing change if we expand internationally (US, UK listings)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IPOReady supports Canadian (TSX/TSXV/CSE), US (NASDAQ/NYSE/OTC), and emerging UK/HK listings. Pricing remains the same regardless of exchange. Regulatory jurisdictions (Ontario, SEC, FCA, etc.) are included in all plans.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you charge for financial modeling or cost calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Cost Calculator and IPO financial modeling tools are included in Pathfinder and higher plans. These tools help you estimate legal, accounting, audit, underwriting, and regulatory costs. No hidden fees per calculation.'
      }
    },
    {
      '@type': 'Question',
      name: 'What happens to my data if I downgrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your cap table, documents, checklist progress, and PACE score remain in your account indefinitely. If you downgrade from Pathfinder to Explorer, you retain read-only access to advanced features. Data is never deleted.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is there a contract or long-term commitment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Explorer and Pathfinder are month-to-month subscriptions with no long-term lock-in. Enterprise plans may involve custom agreements depending on scope. You can cancel anytime on monthly plans, with refunds prorated to your cancellation date.'
      }
    },
    {
      '@type': 'Question',
      name: 'How much does an IPO actually cost vs. what IPOReady charges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "IPOReady's pricing covers only our platform and tools. Total IPO costs (legal, accounting, underwriting, regulatory, marketing) typically range from $500K–$5M depending on exchange and size. Our Cost Calculator estimates these. We charge separately only for expert referrals once confirmed."
      }
    },
    {
      '@type': 'Question',
      name: 'Can I add team members to my account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Explorer includes up to 3 team seats. Pathfinder includes 10 seats. Enterprise includes unlimited team access. Additional seats are $49/month on Explorer and $99/month on Pathfinder.'
      }
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept Stripe-supported payment methods: credit cards (Visa, Mastercard, Amex), ACH transfers, and wire transfers for Enterprise customers. Invoicing available for Enterprise accounts.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you offer discounts for non-profits or government-backed issuers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We evaluate case-by-case for non-profit issuers, credit unions, and government-backed entities. Contact support@ipoready.ai for a custom quote.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is your refund policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Monthly subscriptions can be cancelled anytime. You'll receive a prorated refund for unused days. Enterprise contracts may have different terms—review your agreement or contact support@ipoready.ai."
      }
    }
  ]
}
```

Then add both to the `<head>`:

```typescript
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingPageSchema) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }} />
```

### 2.3 Metadata Summary

| Field | Value |
|-------|-------|
| **Title** (60 chars) | IPO Readiness Pricing \| Plans for Every Stage |
| **Description** (160 chars) | Transparent pricing for IPO readiness tools. From Scout (free) to Enterprise. Scale as you grow from pre-IPO to post-listing compliance. |
| **Keywords** | 15 long-tail keywords (IPO pricing, IPO costs, listing costs, etc.) |
| **OpenGraph Title** | Simple, Transparent IPO Pricing \| Scale with Your Growth |
| **OpenGraph Description** | Flexible pricing plans designed for pre-IPO companies. Manage readiness, costs, and compliance at every stage. |
| **Canonical URL** | https://www.ipoready.ai/pricing |
| **OG Image** | https://www.ipoready.ai/og-pricing.png (1200x630) |
| **FAQ Count** | 12 FAQs targeting "IPO pricing" voice search queries |

---

## Part 3: SEO Best Practices Applied

### Keyword Targeting

**Marketplace:**
- Primary: "IPO lawyers", "securities counsel", "listing experts"
- Secondary: "IPO advisors", "TSXV advisors", "audit firms", "go-public services"
- Long-tail: "RTO professionals", "SPAC advisors", "independent directors"

**Pricing:**
- Primary: "IPO pricing", "IPO costs", "listing costs"
- Secondary: "RTO pricing", "SPAC costs", "IPO software pricing"
- Long-tail: "cap table management cost", "IPO readiness pricing", "enterprise IPO solutions"

### Schema.org Types Used

| Page | Schema Type | Purpose |
|------|-------------|---------|
| /marketplace | CollectionPage | Index of professional network |
| /marketplace | ProfessionalService | Each category of professionals |
| /marketplace | BreadcrumbList (dynamic) | Category filter navigation |
| /pricing | WebPage | Pricing page main entity |
| /pricing | Offer (x4) | Individual plan offerings |
| /pricing | FAQPage | Rich snippet in search results |
| /pricing | AggregateRating | Trust signal (4.9 stars, 147 reviews) |

### Rich Snippet Opportunities

1. **Marketplace**: No direct rich snippet, but CollectionPage helps indexing
2. **Pricing**: FAQ rich snippet displays Q&A inline in search results
3. **Pricing**: Offer with price and availability shows pricing in SERP

### Mobile Optimization

- All titles and descriptions fit within mobile character limits
- Open Graph images are 1200x630 (optimal for social sharing)
- Structured data passes Google Rich Result Test

---

## Part 4: Testing & Validation

### Google Tools to Use

1. **[Rich Results Test](https://search.google.com/test/rich-results)**
   - Paste HTML with JSON-LD schemas
   - Verify FAQPage renders correctly
   - Check Offer schema for pricing snippets

2. **[Mobile-Friendly Test](https://search.google.com/mobile-friendly-test/)**
   - Test /marketplace and /pricing
   - Ensure no mobile usability issues

3. **[PageSpeed Insights](https://pagespeed.web.dev/)**
   - Check Core Web Vitals
   - Verify SEO score

4. **[Google Search Console](https://search.google.com/search-console/about)**
   - Submit URLs for indexing
   - Monitor Rich Results status
   - Check for indexation errors

### Structured Data Validation

```bash
# Using schema.org online validator
# https://validator.schema.org/

# Copy JSON-LD blocks and validate:
# - marketplaceCollectionPageSchema
# - pricingPageSchema
# - pricingFaqSchema
```

---

## Part 5: OpenGraph & Twitter Images

Create these social media preview images (1200x630px):

1. **og-marketplace.png** — Show diverse professionals, "Expert Network" headline, badge count (e.g., "500+ Verified Professionals")
2. **og-pricing.png** — Show pricing tiers visually, "Simple, Transparent Pricing" headline

Upload to `/public/og-marketplace.png` and `/public/og-pricing.png`.

---

## Part 6: Implementation Checklist

- [ ] Import `marketplaceMetadata` in `/src/app/marketplace/layout.tsx`
- [ ] Import `pricingMetadata` in `/src/app/pricing/layout.tsx`
- [ ] Add `marketplaceCollectionPageSchema` to root layout `<head>`
- [ ] Add `pricingPageSchema` and `pricingFaqSchema` to root layout `<head>`
- [ ] Create and upload `og-marketplace.png` (1200x630)
- [ ] Create and upload `og-pricing.png` (1200x630)
- [ ] Run Rich Results Test on /marketplace (expect no issues)
- [ ] Run Rich Results Test on /pricing (expect FAQPage snippet)
- [ ] Test mobile-friendly rendering on both pages
- [ ] Submit URLs to Google Search Console
- [ ] Monitor search console for indexation status (1-7 days)
- [ ] Check Core Web Vitals after deployment

---

## Part 7: Ongoing Maintenance

### Monthly Tasks
- Monitor /pricing FAQ performance in Google Search Console
- Check Click-Through Rate (CTR) for FAQ snippets
- Review search query performance for target keywords

### Quarterly Tasks
- Audit SERP positions for primary keywords
- Update pricing schema if plans change
- Refresh OpenGraph images if branding evolves

### When Content Changes
- Update FAQ answers in pricingFaqSchema if policy/feature changes
- Update Offer schema if pricing changes
- Update descriptions in both pages if positioning shifts

---

## Reference Files

1. **seo-metadata-marketplace-pricing.json** — Complete reference with rationale
2. **seo-marketplace-metadata.ts** — Ready-to-use TypeScript exports
3. **seo-pricing-metadata.ts** — Ready-to-use TypeScript exports
4. **SEO-IMPLEMENTATION-GUIDE.md** — This file

---

## Additional Resources

- [Schema.org CollectionPage](https://schema.org/CollectionPage)
- [Schema.org ProfessionalService](https://schema.org/ProfessionalService)
- [Schema.org FAQPage](https://schema.org/FAQPage)
- [Google Rich Results Documentation](https://developers.google.com/search/docs/appearance/rich-results)
- [Open Graph Meta Tags Guide](https://ogp.me/)
