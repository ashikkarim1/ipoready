import type { Metadata } from 'next'

const GUIDE_METADATA: Record<string, { title: string; description: string; keywords: string[] }> = {
  'ipo-checklist-canada': {
    title: 'Complete IPO Checklist for Canadian Companies | 180 Steps',
    description: 'Master the complete IPO process with our 180-step checklist. Covers all phases from pre-filing to listing for TSX, TSXV, and CSE.',
    keywords: ['ipo checklist', 'going public checklist', 'ipo steps', 'listing checklist'],
  },
  'ipo-vs-direct-listing-vs-spac-vs-rto': {
    title: 'IPO vs Direct Listing vs SPAC vs RTO | Which is Right for You?',
    description: 'Complete comparison of IPO, direct listing, SPAC, and RTO. Pros, cons, costs, timeline, and when to choose each path.',
    keywords: ['ipo vs spac', 'ipo vs rto', 'direct listing vs ipo', 'spac merger'],
  },
  'ipo-cost-breakdown': {
    title: 'IPO Cost Breakdown 2024 | Legal, Audit, Underwriting',
    description: 'Complete breakdown of IPO costs including legal fees, accounting, underwriting, and filing costs for Canadian and US markets.',
    keywords: ['ipo cost', 'ipo fees', 'cost of going public', 'ipo expenses'],
  },
  'spac-merger-guide': {
    title: 'SPAC Merger Complete Guide | Timeline & Process',
    description: 'Step-by-step guide to SPAC mergers. Understand the process, timeline (9-12 months), costs, and how to evaluate SPAC sponsors.',
    keywords: ['spac merger', 'spac process', 'how spac works', 'spac timeline'],
  },
  'tsx-vs-nasdaq-listing': {
    title: 'TSX vs NASDAQ | Listing Requirements & Comparison',
    description: 'Compare TSX and NASDAQ listings. Understand requirements, costs, timeline, and which exchange is right for your company.',
    keywords: ['tsx vs nasdaq', 'nasdaq vs tsx', 'listing comparison', 'which exchange'],
  },
  'rto-guide': {
    title: 'Reverse Takeover (RTO) Complete Guide',
    description: 'Everything you need to know about reverse takeovers. Process, timeline, costs, and comparison to IPO and SPAC.',
    keywords: ['reverse takeover', 'rto', 'shell acquisition', 'rto process'],
  },
  'ipo-timeline': {
    title: 'IPO Timeline | How Long Does IPO Take?',
    description: 'Complete IPO timeline breakdown. Understand each phase, typical duration (6-12 months), and how to accelerate the process.',
    keywords: ['ipo timeline', 'how long ipo', 'ipo process timeline', 'ipo phases'],
  },
  'ipo-readiness-assessment': {
    title: 'IPO Readiness Assessment | Are You Ready?',
    description: 'Self-assessment checklist to determine if your company is ready for an IPO. Financial, governance, and operational criteria.',
    keywords: ['ipo readiness', 'is my company ready for ipo', 'ipo requirements'],
  },
  'sedar-2-filing': {
    title: 'SEDAR 2 Filing Requirements | IPO Compliance Guide',
    description: 'Complete guide to SEDAR 2 filing requirements for Canadian IPOs. Forms, documents, timeline, and compliance steps.',
    keywords: ['sedar 2', 'sedar filing', 'prospectus filing', 'securities filing'],
  },
  'cse-listing-guide': {
    title: 'CSE Listing Guide | Fast-Track to Public Markets',
    description: 'Complete guide to listing on the Canadian Securities Exchange (CSE). Fastest path to public trading in Canada.',
    keywords: ['cse listing', 'canadian securities exchange', 'cse requirements', 'fast listing'],
  },
  'direct-listing-guide': {
    title: 'Direct Listing Guide | Alternative to IPO',
    description: 'Complete direct listing guide. Understand the process, costs, timeline, and when direct listing is better than IPO.',
    keywords: ['direct listing', 'direct ipo', 'nyse direct listing', 'direct public offering'],
  },
  'ipo-due-diligence': {
    title: 'IPO Due Diligence | Underwriter Checklist',
    description: 'Complete IPO due diligence guide for underwriters. Legal, financial, and operational due diligence requirements.',
    keywords: ['ipo due diligence', 'underwriter due diligence', 'ipo process'],
  },
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const meta = GUIDE_METADATA[params.slug] || {
    title: 'IPO Guide | IPOReady Learning Hub',
    description: 'Learn about going public with our comprehensive IPO guides.',
    keywords: ['ipo', 'guide', 'learning'],
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url: `https://www.ipoready.ai/guides/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}
