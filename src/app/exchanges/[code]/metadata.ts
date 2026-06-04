import type { Metadata } from 'next'

const EXCHANGE_METADATA: Record<string, { title: string; description: string; keywords: string[] }> = {
  tsx: {
    title: 'TSX Listing Guide | Requirements, Timeline & Costs',
    description: 'Complete TSX listing guide for Canadian companies. Requirements, process, timeline (6-12 months), costs ($500K-$2M), and FAQs.',
    keywords: ['tsx listing', 'tsx requirements', 'how to list on tsx', 'tsx timeline', 'toronto venture exchange'],
  },
  tsxv: {
    title: 'TSXV Listing Guide | Early-Stage Companies',
    description: 'TSXV listing guide for growth-stage companies. Requirements, timeline (4-8 months), costs ($300K-$1M), and process.',
    keywords: ['tsxv listing', 'tsx venture', 'tsxv requirements', 'venture exchange'],
  },
  cse: {
    title: 'CSE Listing Guide | Fast-Track to Public',
    description: 'Canadian Securities Exchange (CSE) listing guide. Fastest path to going public in Canada (2-4 months, $100K-$400K).',
    keywords: ['cse listing', 'canadian securities exchange', 'fast listing', 'cse requirements'],
  },
  nasdaq: {
    title: 'NASDAQ Listing Guide | US IPO Requirements',
    description: 'NASDAQ IPO guide for companies going public in the US. Requirements, timeline (6-12 months), costs ($1M-$3M), and process.',
    keywords: ['nasdaq ipo', 'nasdaq listing', 'nasdaq requirements', 'how to list on nasdaq'],
  },
  nyse: {
    title: 'NYSE Listing Guide | New York Stock Exchange',
    description: 'NYSE listing guide for large-cap companies. Requirements, timeline (8-14 months), costs ($2M-$5M), and process.',
    keywords: ['nyse listing', 'new york stock exchange', 'nyse requirements', 'how to list on nyse'],
  },
  otc: {
    title: 'OTC Markets Listing Guide | Pink Sheets',
    description: 'OTC Markets (Pink Sheets) listing guide. Fastest and most affordable path to public trading (1-2 months).',
    keywords: ['otc markets', 'pink sheets', 'otc listing', 'over the counter markets'],
  },
  cboe: {
    title: 'Cboe Canada Listing Guide',
    description: 'Cboe Canada exchange listing guide for Canadian growth companies. Requirements, timeline, and process.',
    keywords: ['cboe canada', 'cboe listing', 'canadian exchange'],
  },
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const meta = EXCHANGE_METADATA[params.code] || {
    title: 'Exchange Listing Guide | IPOReady',
    description: 'Complete guide to listing your company on major exchanges.',
    keywords: ['listing', 'ipo', 'exchange'],
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `https://www.ipoready.ai/exchanges/${params.code}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}
