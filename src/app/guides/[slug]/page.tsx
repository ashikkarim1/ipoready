import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
import { ArrowRight, BookOpen, Clock, CheckCircle2 } from 'lucide-react'

// Guide data - placeholder content ready for real writing
const GUIDES: Record<string, any> = {
  'ipo-checklist-canada': {
    title: 'The Complete IPO Checklist for Canadian Companies',
    description: 'Master every step of the IPO process across TSX, TSXV, and CSE.',
    readTime: 18,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    featured: true,
    sections: [
      { title: 'Getting Started', content: 'Before you begin your IPO journey, ensure your company meets basic readiness criteria...' },
      { title: 'Pre-Filing Phase', content: 'The pre-filing phase is critical. This is where you assemble your team, prepare financial statements, and conduct due diligence...' },
      { title: 'Filing Phase', content: 'Work with your securities lawyers to prepare and file the prospectus with the exchange...' },
      { title: 'Marketing Phase', content: 'Your underwriter will conduct a roadshow to present to institutional investors...' },
      { title: 'Closing Phase', content: 'Final preparations for listing day, price setting, and going public...' },
    ],
    toc: ['Getting Started', 'Pre-Filing Phase', 'Filing Phase', 'Marketing Phase', 'Closing Phase'],
    relatedGuides: [
      { title: 'IPO vs Direct Listing vs SPAC', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' },
      { title: 'IPO Cost Breakdown', slug: 'ipo-cost-breakdown' },
    ],
    cta: { title: 'Ready to Go Public?', description: 'Use IPOReady to track all 180 IPO milestones in one place.', buttonText: 'Start Your IPO Journey', buttonLink: '/register' }
  },
  'ipo-vs-direct-listing-vs-spac-vs-rto': {
    title: 'IPO vs Direct Listing vs SPAC vs RTO: Which Path is Right for You?',
    description: 'Complete comparison of all four paths to going public. Understand pros, cons, costs, and timelines.',
    readTime: 22,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    featured: true,
    sections: [
      { title: 'Traditional IPO', content: 'The most common path to going public. Underwriter-led process with roadshow, pricing, and capital raise...' },
      { title: 'Direct Listing', content: 'Alternative to IPO where existing shares are listed directly without capital raise...' },
      { title: 'SPAC Merger', content: 'Merge with a Special Purpose Acquisition Company for faster, more certain path to public markets...' },
      { title: 'Reverse Takeover (RTO)', content: 'Acquire a shell company already listed on the exchange...' },
      { title: 'Comparison Matrix', content: 'Side-by-side comparison of costs, timeline, dilution, and strategic fit for each path...' },
    ],
    toc: ['Traditional IPO', 'Direct Listing', 'SPAC Merger', 'Reverse Takeover', 'Comparison Matrix'],
    relatedGuides: [{ title: 'SPAC Merger Guide', slug: 'spac-merger-guide' }, { title: 'RTO Guide', slug: 'rto-guide' }],
    cta: { title: 'Find Your Path to Public Markets', description: 'IPOReady helps you compare and execute any path.', buttonText: 'Analyze Your Options', buttonLink: '/dashboard' }
  },
  'ipo-cost-breakdown': {
    title: 'IPO Cost Breakdown 2024 | Legal, Audit, Underwriting & Filing',
    description: 'Detailed breakdown of all IPO costs. Understanding legal fees, accounting, underwriting, and filing expenses.',
    readTime: 15,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Legal Fees', content: 'Securities lawyers typically charge $150K-$800K depending on exchange and complexity...' },
      { title: 'Accounting & Audit', content: 'CPAB auditors and accounting firms charge $80K-$300K for IPO audit and financial statement preparation...' },
      { title: 'Underwriting Fees', content: 'Underwriters typically take 3-7% of gross IPO proceeds as their commission...' },
      { title: 'Filing & Exchange Fees', content: 'TSX, NASDAQ, and other exchanges charge filing fees ranging from $20K-$100K...' },
      { title: 'Other Costs', content: 'Printing, investor relations, stock transfer agent, and miscellaneous expenses...' },
    ],
    toc: ['Legal Fees', 'Accounting & Audit', 'Underwriting Fees', 'Filing & Exchange Fees', 'Other Costs'],
    relatedGuides: [{ title: 'IPO Timeline', slug: 'ipo-timeline' }],
    cta: { title: 'Budget for Your IPO', description: 'Use our cost calculator to estimate your specific IPO costs.', buttonText: 'Go to Cost Calculator', buttonLink: '/dashboard/financial-mgmt/cost-calculator' }
  },
  'spac-merger-guide': {
    title: 'SPAC Merger Complete Guide: Process, Timeline & Costs',
    description: 'Everything you need to know about merging with a SPAC. Process, timeline (9-12 months), costs, and evaluation criteria.',
    readTime: 20,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'What is a SPAC?', content: 'A Special Purpose Acquisition Company is a shell company raised to acquire an operating business...' },
      { title: 'Finding a SPAC Partner', content: 'Identifying and evaluating potential SPAC sponsors and targets for your company...' },
      { title: 'Merger Process', content: 'Step-by-step process from LOI through shareholder vote and listing...' },
      { title: 'SPAC Fees & Costs', content: 'Understanding sponsor promote, underwriting fees, and other SPAC-specific costs...' },
      { title: 'Risk & Considerations', content: 'Market risk, shareholder redemptions, and post-merger integration challenges...' },
    ],
    toc: ['What is a SPAC?', 'Finding a SPAC Partner', 'Merger Process', 'SPAC Fees & Costs', 'Risk & Considerations'],
    relatedGuides: [{ title: 'IPO vs Direct Listing vs SPAC', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' }],
    cta: { title: 'Evaluate SPAC Opportunities', description: 'IPOReady helps you track SPAC negotiations and merger milestones.', buttonText: 'Get Started', buttonLink: '/register' }
  },
  'tsx-vs-nasdaq-listing': {
    title: 'TSX vs NASDAQ: Listing Requirements & Comparison',
    description: 'Compare Canadian TSX and US NASDAQ listings. Requirements, costs, timeline, and strategic fit.',
    readTime: 16,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'TSX Overview', content: 'The primary exchange for Canadian companies. Requirements, investor base, and strategic fit...' },
      { title: 'NASDAQ Overview', content: 'The tech-focused US exchange. Requirements for Canadian companies, regulatory considerations...' },
      { title: 'Financial Requirements', content: 'Comparing minimum shareholder equity, public float requirements, and profitability expectations...' },
      { title: 'Timeline Comparison', content: 'TSX typically 6-12 months, NASDAQ 6-12 months, with different review timelines...' },
      { title: 'Cost Analysis', content: 'TSX costs typically lower than NASDAQ due to domestic vs. cross-border dynamics...' },
    ],
    toc: ['TSX Overview', 'NASDAQ Overview', 'Financial Requirements', 'Timeline Comparison', 'Cost Analysis'],
    relatedGuides: [{ title: 'IPO Checklist Canada', slug: 'ipo-checklist-canada' }],
    cta: { title: 'Choose Your Exchange', description: 'Let IPOReady help you evaluate the best listing strategy.', buttonText: 'Explore Options', buttonLink: '/dashboard' }
  },
  'rto-guide': {
    title: 'Reverse Takeover (RTO) Complete Guide',
    description: 'Master the RTO process. Find shell companies, negotiate, merge, and become public.',
    readTime: 19,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'What is an RTO?', content: 'A reverse takeover is when a private company acquires a publicly-listed shell company...' },
      { title: 'Finding Shell Companies', content: 'Where to find RTO candidates, evaluating their regulatory status and trading history...' },
      { title: 'RTO Process', content: 'Due diligence, negotiation, shareholder approvals, regulatory filings, and closing...' },
      { title: 'RTO vs IPO', content: 'Comparing costs, timeline, dilution, and regulatory burden between RTO and IPO paths...' },
      { title: 'Post-Merger Considerations', content: 'Name change, governance, disclosure obligations, and investor communication...' },
    ],
    toc: ['What is an RTO?', 'Finding Shell Companies', 'RTO Process', 'RTO vs IPO', 'Post-Merger Considerations'],
    relatedGuides: [{ title: 'IPO vs Direct Listing vs SPAC', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' }],
    cta: { title: 'Execute Your RTO', description: 'IPOReady tracks every RTO milestone and compliance requirement.', buttonText: 'Start Your RTO', buttonLink: '/register' }
  },
  'ipo-timeline': {
    title: 'IPO Timeline: How Long Does IPO Take?',
    description: 'Complete breakdown of IPO timeline by phase. Typical duration 6-12 months with acceleration strategies.',
    readTime: 12,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Phase 1: Planning & Preparation (2-4 months)', content: 'Assemble team, prepare financials, conduct readiness assessment...' },
      { title: 'Phase 2: Filing & Due Diligence (2-4 months)', content: 'Prepare prospectus, file with exchange, conduct underwriter due diligence...' },
      { title: 'Phase 3: Marketing (4-8 weeks)', content: 'Roadshow, investor presentations, price building...' },
      { title: 'Phase 4: Closing (1-2 weeks)', content: 'Final regulatory approvals, price setting, trading commencement...' },
      { title: 'Timeline Acceleration Strategies', content: 'Tips for expediting your IPO without compromising readiness...' },
    ],
    toc: ['Phase 1: Planning', 'Phase 2: Filing', 'Phase 3: Marketing', 'Phase 4: Closing', 'Acceleration Strategies'],
    relatedGuides: [{ title: 'IPO Checklist Canada', slug: 'ipo-checklist-canada' }],
    cta: { title: 'Plan Your Timeline', description: 'IPOReady tracks all IPO phases with realistic deadline management.', buttonText: 'Create Timeline', buttonLink: '/dashboard' }
  },
  'ipo-readiness-assessment': {
    title: 'IPO Readiness Assessment: Are You Ready to Go Public?',
    description: 'Self-assessment checklist for IPO readiness. Financial, governance, operational, and strategic criteria.',
    readTime: 14,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Financial Readiness', content: 'Revenue requirements, profitability, cash flow, audit-ready financials...' },
      { title: 'Governance Readiness', content: 'Board structure, audit committee, policies, and regulatory compliance...' },
      { title: 'Operational Readiness', content: 'Controls, systems, documentation, and scalability for public company operations...' },
      { title: 'Market Readiness', content: 'Addressable market size, growth trajectory, competitive positioning...' },
      { title: 'Readiness Score Interpretation', content: 'What your score means and recommended next steps...' },
    ],
    toc: ['Financial Readiness', 'Governance Readiness', 'Operational Readiness', 'Market Readiness', 'Score Interpretation'],
    relatedGuides: [{ title: 'IPO Timeline', slug: 'ipo-timeline' }],
    cta: { title: 'Assess Your Readiness', description: 'Use IPOReady\'s PACE tool to measure your IPO readiness in real-time.', buttonText: 'Take Assessment', buttonLink: '/dashboard' }
  },
  'sedar-2-filing': {
    title: 'SEDAR 2 Filing Requirements & Compliance Guide',
    description: 'Master SEDAR 2 filing requirements for Canadian IPOs. Forms, documents, timeline, and compliance.',
    readTime: 13,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'What is SEDAR 2?', content: 'Canada\'s Securities Data System 2 is the platform for all securities filings...' },
      { title: 'Required IPO Forms', content: 'Form F-1 equivalent, prospectus, financial statements, auditor consents...' },
      { title: 'Document Preparation', content: 'What documents you need, who prepares them, and submission requirements...' },
      { title: 'Filing Process', content: 'Step-by-step process for submitting through SEDAR 2...' },
      { title: 'Post-Filing Obligations', content: 'Continuous disclosure, quarterly filings, insider trading reports...' },
    ],
    toc: ['What is SEDAR 2?', 'Required IPO Forms', 'Document Preparation', 'Filing Process', 'Post-Filing Obligations'],
    relatedGuides: [{ title: 'IPO Checklist Canada', slug: 'ipo-checklist-canada' }],
    cta: { title: 'Navigate SEDAR 2', description: 'IPOReady provides SEDAR 2 filing checklists and document templates.', buttonText: 'View Templates', buttonLink: '/templates' }
  },
  'cse-listing-guide': {
    title: 'CSE Listing Guide: The Fastest Path to Public Markets',
    description: 'Complete CSE (Canadian Securities Exchange) listing guide. Fast-track listing in 2-4 months.',
    readTime: 11,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Why Choose CSE?', content: 'Faster timeline, lower costs, and lighter regulatory requirements than TSX/TSXV...' },
      { title: 'CSE Requirements', content: 'Financial, governance, and operational requirements specific to CSE...' },
      { title: 'CSE Application Process', content: 'Application, review, and approval timeline (typically 2-4 months)...' },
      { title: 'CSE vs TSX/TSXV', content: 'Comparison of requirements, costs, and investor base...' },
      { title: 'Post-Listing Requirements', content: 'Ongoing reporting and compliance obligations as a CSE-listed company...' },
    ],
    toc: ['Why Choose CSE?', 'CSE Requirements', 'Application Process', 'CSE vs TSX/TSXV', 'Post-Listing Requirements'],
    relatedGuides: [{ title: 'TSX vs NASDAQ', slug: 'tsx-vs-nasdaq-listing' }],
    cta: { title: 'List on CSE Fast', description: 'IPOReady tracks CSE listing requirements and timeline.', buttonText: 'Start CSE Listing', buttonLink: '/register' }
  },
  'direct-listing-guide': {
    title: 'Direct Listing Guide: Alternative to IPO',
    description: 'Master direct listings. Process, timeline, costs, and when direct listing is better than IPO.',
    readTime: 13,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'What is a Direct Listing?', content: 'A public offering of existing shares without capital raise...' },
      { title: 'Direct Listing vs IPO', content: 'Key differences in process, pricing, costs, and outcomes...' },
      { title: 'Direct Listing Process', content: 'SEC approval, underwriter selection, pricing methodology...' },
      { title: 'Direct Listing Costs', content: 'Lower costs than IPO since there\'s no underwriting discount...' },
      { title: 'When to Choose Direct Listing', content: 'Strategic fit for companies with strong secondary market liquidity...' },
    ],
    toc: ['What is Direct Listing?', 'Direct Listing vs IPO', 'Direct Listing Process', 'Costs', 'When to Choose'],
    relatedGuides: [{ title: 'IPO vs Direct Listing vs SPAC', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' }],
    cta: { title: 'Explore Direct Listing', description: 'Is direct listing right for your company? Evaluate with IPOReady.', buttonText: 'Analyze Direct Listing', buttonLink: '/dashboard' }
  },
  'ipo-due-diligence': {
    title: 'IPO Due Diligence: Underwriter Checklist',
    description: 'Complete due diligence guide for IPO underwriters. Legal, financial, and operational procedures.',
    readTime: 17,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Financial Due Diligence', content: 'Audit, financials review, tax compliance, working capital analysis...' },
      { title: 'Legal Due Diligence', content: 'Corporate documents, litigation, regulatory compliance, material contracts...' },
      { title: 'Operational Due Diligence', content: 'Systems, controls, personnel, facilities, and scalability assessment...' },
      { title: 'Underwriter Perspective', content: 'What underwriters look for and how to prepare for their review...' },
      { title: 'Addressing Due Diligence Findings', content: 'Remediation, waivers, and disclosure of identified issues...' },
    ],
    toc: ['Financial Due Diligence', 'Legal Due Diligence', 'Operational Due Diligence', 'Underwriter Perspective', 'Addressing Findings'],
    relatedGuides: [{ title: 'IPO Checklist Canada', slug: 'ipo-checklist-canada' }],
    cta: { title: 'Prepare for Due Diligence', description: 'IPOReady prepares you for underwriter due diligence review.', buttonText: 'View Checklist', buttonLink: '/templates' }
  },
}

export async function generateStaticParams() {
  return [
    { slug: 'ipo-checklist-canada' },
    { slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' },
    { slug: 'ipo-cost-breakdown' },
    { slug: 'spac-merger-guide' },
    { slug: 'tsx-vs-nasdaq-listing' },
    { slug: 'rto-guide' },
    { slug: 'ipo-timeline' },
    { slug: 'ipo-readiness-assessment' },
    { slug: 'sedar-2-filing' },
    { slug: 'cse-listing-guide' },
    { slug: 'direct-listing-guide' },
    { slug: 'ipo-due-diligence' },
  ]
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = GUIDES[params.slug]

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Guide not found</h1>
          <Link href="/resources" className="text-accent hover:underline">
            Back to Resources →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" style={{ color: '#E8312A' }} />
            <span className="label-sm font-semibold" style={{ color: '#E8312A' }}>
              {guide.category}
            </span>
          </div>

          <h1 className="serif text-4xl md:text-5xl mb-4 leading-tight" style={{ color: '#1A1A1A' }}>
            {guide.title}
          </h1>

          <p className="text-lg mb-6" style={{ color: '#666666' }}>
            {guide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#9A9A9A' }}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{guide.readTime} min read</span>
            </div>
            <span>•</span>
            <span>Updated {guide.updated}</span>
            <span>•</span>
            <span>By {guide.author}</span>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <div className="prose prose-lg max-w-none" style={{ color: '#333333' }}>
              {guide.sections.map((section: any, idx: number) => (
                <div key={idx} className="mb-12">
                  <h2 className="serif text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                    {section.title}
                  </h2>
                  <p style={{ color: '#666666', lineHeight: 1.7 }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Related guides */}
            {guide.relatedGuides.length > 0 && (
              <div className="mt-16 pt-12 border-t border-gray-200">
                <h3 className="font-bold text-lg mb-6" style={{ color: '#1A1A1A' }}>
                  Related Guides
                </h3>
                <div className="space-y-3">
                  {guide.relatedGuides.map((related: any) => (
                    <Link
                      key={related.slug}
                      href={`/guides/${related.slug}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                    >
                      <span style={{ color: '#1A1A1A' }}>{related.title}</span>
                      <ArrowRight className="w-4 h-4" style={{ color: '#E8312A' }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar TOC */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="sticky top-20 bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Table of Contents
              </h3>
              <ul className="space-y-2">
                {guide.toc.map((item: string) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm hover:underline"
                      style={{ color: '#666666' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {guide.cta && (
        <section className="bg-white border-t border-gray-200 py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h2 className="serif text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                {guide.cta.title}
              </h2>
              <p className="text-lg mb-6" style={{ color: '#666666' }}>
                {guide.cta.description}
              </p>
              <Link
                href={guide.cta.buttonLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition"
                style={{ background: '#E8312A' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#D62518')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
              >
                {guide.cta.buttonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
