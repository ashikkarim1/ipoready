import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
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
  },
  cse: {
    name: 'CSE',
    fullName: 'Canadian Securities Exchange',
    description: 'Alternative exchange with lighter requirements than TSX/TSXV.',
    tier: 'Growth',
    timeline: '2-4 months',
    estimatedCost: '$100K-$400K',
    bestFor: 'Growth-stage companies seeking faster listing',
  },
  nasdaq: {
    name: 'NASDAQ',
    fullName: 'NASDAQ Stock Exchange',
    description: 'US tech-focused exchange with global reach.',
    tier: 'Premium',
    timeline: '6-12 months',
    estimatedCost: '$1M-$3M',
    bestFor: 'Technology and growth companies seeking US capital',
  },
  nyse: {
    name: 'NYSE',
    fullName: 'New York Stock Exchange',
    description: 'The world\'s largest stock exchange.',
    tier: 'Premium',
    timeline: '8-14 months',
    estimatedCost: '$2M-$5M',
    bestFor: 'Large-cap, established companies',
  },
  otc: {
    name: 'OTC Markets',
    fullName: 'Over-the-Counter Markets',
    description: 'Decentralized market for unlisted securities.',
    tier: 'Growth',
    timeline: '1-2 months',
    estimatedCost: '$10K-$100K',
    bestFor: 'Small-cap companies or SPAC shells',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Exchange not found</h1>
          <Link href="/dashboard" className="text-accent hover:underline">
            Back to IPOReady →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4" style={{ color: '#E8312A' }} />
            <span className="label-sm font-semibold" style={{ color: '#E8312A' }}>
              Exchange Profile
            </span>
          </div>

          <h1 className="serif text-5xl mb-4 leading-tight" style={{ color: '#1A1A1A' }}>
            {exchange.name} Listing Guide
          </h1>

          <p className="text-xl mb-8" style={{ color: '#666666' }}>
            {exchange.description}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" style={{ color: '#E8312A' }} />
                <span className="text-sm font-medium" style={{ color: '#666666' }}>Timeline</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{exchange.timeline}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" style={{ color: '#2D7A5F' }} />
                <span className="text-sm font-medium" style={{ color: '#666666' }}>Est. Cost</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{exchange.estimatedCost}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#0066CC' }} />
                <span className="text-sm font-medium" style={{ color: '#666666' }}>Tier</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{exchange.tier}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#2D7A5F' }} />
                <span className="text-sm font-medium" style={{ color: '#666666' }}>Best For</span>
              </div>
              <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{exchange.bestFor}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="space-y-12">
            {exchange.sections && exchange.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h2 className="serif text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
                  {section.title}
                </h2>
                <div className="bg-white rounded-lg p-8 border border-gray-200">
                  <div className="space-y-4">
                    {section.subsections && section.subsections.map((subsection: string) => (
                      <div key={subsection} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: '#2D7A5F', flexShrink: 0 }} />
                        <p style={{ color: '#1A1A1A' }}>{subsection}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          {exchange.faq && (
            <div className="mt-16">
              <h2 className="serif text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {exchange.faq.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                      {faq.q}
                    </h3>
                    <p style={{ color: '#666666' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="serif text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              Ready to List on {exchange.name}?
            </h2>
            <p className="text-lg mb-6" style={{ color: '#666666' }}>
              Track your entire {exchange.name} listing journey with IPOReady.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition"
              style={{ background: '#E8312A' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D62518')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
            >
              Start Your {exchange.name} Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
