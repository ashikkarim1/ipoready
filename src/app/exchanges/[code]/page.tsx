import Link from 'next/link'
import { ArrowRight, CheckCircle2, Globe, Clock, DollarSign, TrendingUp } from 'lucide-react'

// Exchange data
const EXCHANGES: Record<string, any> = {
  tsx: {
    name: 'TSX',
    fullName: 'Toronto Venture Exchange',
    description: 'The primary exchange for established Canadian companies.',
    tier: 'Tier 1',
    requirements: {
      minPublic: 1000000,
      minFloatSize: '$2M-$4M',
      profitability: 'Profitable or have realistic path',
      history: '3 years continuous business',
    },
    timeline: '6-12 months',
    estimatedCost: '$500K-$2M',
    bestFor: 'Established, profitable Canadian companies',
    keyStats: [
      { label: 'Public Issuers', value: '1,500+' },
      { label: 'Market Cap', value: '$2.3T' },
      { label: 'Founded', value: '1852' },
    ],
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'TSX Listing Process', subsections: ['Pre-filing', 'Filing', 'Review period', 'Approval & trading'] },
      { title: 'Costs & Fees', subsections: ['Listing fees', 'Ongoing costs', 'Professional fees'] },
      { title: 'Timeline', subsections: ['Phase 1: Planning', 'Phase 2: Filing', 'Phase 3: Review', 'Phase 4: Listing'] },
    ],
    faq: [
      { q: 'What are the financial requirements for TSX?', a: 'TSX typically requires...' },
      { q: 'How long does TSX listing take?', a: 'The timeline typically spans...' },
      { q: 'What is the TSX Tier 1 vs Tier 2?', a: 'TSX has two listing tiers...' },
    ],
  },
  tsxv: {
    name: 'TSXV',
    fullName: 'TSX Venture Exchange',
    description: 'For emerging companies with development-stage operations.',
    tier: 'Emerging Growth',
    timeline: '4-8 months',
    estimatedCost: '$300K-$1M',
    bestFor: 'Early-stage, growth, and emerging companies',
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'TSXV Listing Process', subsections: ['Application', 'Review', 'Approval', 'Trading'] },
    ],
  },
  cse: {
    name: 'CSE',
    fullName: 'Canadian Securities Exchange',
    description: 'Alternative exchange with lighter requirements than TSX/TSXV.',
    tier: 'Growth',
    timeline: '2-4 months',
    estimatedCost: '$100K-$400K',
    bestFor: 'Growth-stage companies seeking faster listing',
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'CSE Listing Process', subsections: ['Application', 'Review', 'Approval', 'Trading'] },
    ],
  },
  nasdaq: {
    name: 'NASDAQ',
    fullName: 'NASDAQ Stock Exchange',
    description: 'US tech-focused exchange with global reach.',
    tier: 'Premium',
    timeline: '6-12 months',
    estimatedCost: '$1M-$3M',
    bestFor: 'Technology and growth companies seeking US capital',
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'NASDAQ Listing Process', subsections: ['SEC filing', 'Underwriter review', 'Marketing', 'Listing'] },
    ],
  },
  nyse: {
    name: 'NYSE',
    fullName: 'New York Stock Exchange',
    description: 'The world\'s largest stock exchange.',
    tier: 'Premium',
    timeline: '8-14 months',
    estimatedCost: '$2M-$5M',
    bestFor: 'Large-cap, established companies',
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'NYSE Listing Process', subsections: ['SEC filing', 'Underwriter review', 'Marketing', 'Listing'] },
    ],
  },
  otc: {
    name: 'OTC Markets',
    fullName: 'Over-the-Counter Markets',
    description: 'Decentralized market for unlisted securities.',
    tier: 'Growth',
    timeline: '1-2 months',
    estimatedCost: '$10K-$100K',
    bestFor: 'Small-cap companies or SPAC shells',
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'OTC Listing Process', subsections: ['Registration', 'Approval', 'Trading'] },
    ],
  },
  cboe: {
    name: 'Cboe Canada',
    fullName: 'Cboe Canada Exchange',
    description: 'Canadian exchange for growth companies.',
    tier: 'Growth',
    timeline: '4-6 months',
    estimatedCost: '$250K-$800K',
    bestFor: 'Canadian growth companies',
    sections: [
      { title: 'Listing Requirements', subsections: ['Financial requirements', 'Governance requirements', 'Public float requirements'] },
      { title: 'Cboe Listing Process', subsections: ['Application', 'Review', 'Approval', 'Trading'] },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(EXCHANGES).map((code) => ({
    code,
  }))
}

export default function ExchangePage({ params }: { params: { code: string } }) {
  const exchange = EXCHANGES[params.code]

  if (!exchange) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F6F4' }}>
        <div className="text-center">
          <h1 className="h1 text-nav mb-4">Exchange not found</h1>
          <Link href="/resources" className="text-accent hover:underline font-medium">
            Back to Resources →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F6F4', minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #E5E4E0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', textDecoration: 'none' }}>
            IPOReady
          </Link>
          <div className="flex gap-6">
            <Link href="/resources" style={{ color: '#1A1A1A', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Resources
            </Link>
            <Link href="/register" style={{ color: '#FFFFFF', background: '#E8312A', padding: '0.5rem 1rem', borderRadius: '9999px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
              <Globe className="w-5 h-5" style={{ color: '#1D4ED8' }} />
            </div>
            <span className="pill text-xs font-bold uppercase tracking-wider" style={{ background: '#FDECEB', color: '#E8312A' }}>
              Exchange Profile
            </span>
          </div>

          <h1 className="serif" style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: '1.2', marginBottom: '1.25rem', color: '#1A1A1A' }}>
            {exchange.name} Listing Guide
          </h1>

          <p className="text-lg leading-relaxed" style={{ marginBottom: '2.5rem', color: '#666666', maxWidth: '700px' }}>
            {exchange.description}
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl p-6" style={{ background: '#FDECEB', border: '1px solid #FECACA' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: '#E8312A' }} />
                <span className="label-sm font-semibold text-amber-700">Timeline</span>
              </div>
              <p className="h3" style={{ color: '#E8312A' }}>{exchange.timeline}</p>
            </div>

            <div className="rounded-xl p-6" style={{ background: '#EAF5F0', border: '1px solid #BBEAD4' }}>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4" style={{ color: '#2D7A5F' }} />
                <span className="label-sm font-semibold text-green-700">Est. Cost</span>
              </div>
              <p className="h3" style={{ color: '#2D7A5F' }}>{exchange.estimatedCost}</p>
            </div>

            <div className="rounded-xl p-6" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: '#1D4ED8' }} />
                <span className="label-sm font-semibold text-blue-700">Tier</span>
              </div>
              <p className="h3" style={{ color: '#1D4ED8' }}>{exchange.tier}</p>
            </div>

            <div className="rounded-xl p-6" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#B45309' }} />
                <span className="label-sm font-semibold text-amber-900">Best For</span>
              </div>
              <p className="body-sm" style={{ color: '#78350F' }}>{exchange.bestFor}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto" style={{ paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div>
          <div className="space-y-8">
            {exchange.sections && exchange.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h2 className="h2" style={{ marginBottom: '1.5rem', color: '#1A1A1A' }}>
                  {section.title}
                </h2>
                <div className="rounded-xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
                  <div className="space-y-4">
                    {section.subsections && section.subsections.map((subsection: string, sidx: number) => (
                      <div key={sidx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#2D7A5F' }} />
                        <p className="body-sm" style={{ color: '#1A1A1A' }}>{subsection}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          {exchange.faq && (
            <div style={{ marginTop: '3rem' }}>
              <h2 className="h2" style={{ marginBottom: '1.5rem', color: '#1A1A1A' }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {exchange.faq.map((faq: any, idx: number) => (
                  <div key={idx} className="rounded-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
                    <h3 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                      {faq.q}
                    </h3>
                    <p className="body-sm" style={{ color: '#666666' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div>
            <h2 className="h2 mb-3" style={{ color: '#1A1A1A' }}>
              Ready to List on {exchange.name}?
            </h2>
            <p className="body text-lg mb-6" style={{ color: '#666666' }}>
              Track your entire {exchange.name} listing journey with IPOReady.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition hover:opacity-90"
              style={{ background: '#E8312A' }}
            >
              Start Your {exchange.name} Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
