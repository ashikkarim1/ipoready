import Link from 'next/link'
import { ArrowRight, BookOpen, Clock, CheckCircle2, Bookmark } from 'lucide-react'

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
    title: 'IPO Cost Breakdown: What You\'ll Actually Pay',
    description: 'Complete breakdown of IPO costs. Understand all fees and costs for Canadian and US IPOs.',
    readTime: 15,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Underwriting Fees', content: 'Underwriter discount, management fees, and selling concessions...' },
      { title: 'Legal & Professional Fees', content: 'Securities lawyers, accountants, auditors, financial advisors...' },
      { title: 'Regulatory & Filing Fees', content: 'Exchange fees, securities commission fees, printing and filing costs...' },
      { title: 'Marketing & Roadshow Costs', content: 'Investor presentations, marketing materials, travel and logistics...' },
      { title: 'Total Cost Analysis', content: 'Typical total cost range by exchange and company size...' },
    ],
    toc: ['Underwriting Fees', 'Legal Fees', 'Regulatory Fees', 'Marketing Costs', 'Total Cost Analysis'],
    relatedGuides: [{ title: 'IPO Timeline', slug: 'ipo-timeline' }],
    cta: { title: 'Budget Your IPO', description: 'Use IPOReady to forecast and track all IPO costs.', buttonText: 'Cost Calculator', buttonLink: '/dashboard' }
  },
  'spac-merger-guide': {
    title: 'SPAC Merger Guide: Complete Process & Timeline',
    description: 'Everything you need to know about SPAC mergers. Process, timeline (9-12 months), costs, and benefits.',
    readTime: 19,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'What is a SPAC?', content: 'Special Purpose Acquisition Company, blank-check companies, and why they exist...' },
      { title: 'SPAC Merge vs IPO', content: 'Comparison of SPAC merger vs traditional IPO route...' },
      { title: 'Finding and Evaluating SPACs', content: 'How to find potential SPAC partners and assess their quality...' },
      { title: 'Merger Process & Timeline', content: '9-12 month process from target identification to public trading...' },
      { title: 'SPAC Risks and Considerations', content: 'Dilution, redemptions, regulatory scrutiny, and success rates...' },
    ],
    toc: ['What is a SPAC?', 'SPAC vs IPO', 'Finding SPACs', 'Merger Process', 'Risks & Considerations'],
    relatedGuides: [{ title: 'IPO vs Direct Listing vs SPAC', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' }],
    cta: { title: 'Explore SPAC Option', description: 'Track your SPAC merger journey with IPOReady.', buttonText: 'Start SPAC Track', buttonLink: '/register' }
  },
  'tsx-vs-nasdaq-listing': {
    title: 'TSX vs NASDAQ: Which Exchange is Right for You?',
    description: 'Compare TSX and NASDAQ. Understand requirements, costs, timeline, and strategic fit.',
    readTime: 14,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'TSX Overview', content: 'Tier 1 Canadian exchange for established, profitable companies...' },
      { title: 'NASDAQ Overview', content: 'US tech-focused exchange with 40% of global trading volume...' },
      { title: 'Financial Requirements Comparison', content: 'Revenue, profitability, public float, and market cap requirements...' },
      { title: 'Cost & Timeline Comparison', content: 'Total IPO costs and timeline comparison between exchanges...' },
      { title: 'Strategic Considerations', content: 'Investor base, trading volume, capital access, and market positioning...' },
    ],
    toc: ['TSX Overview', 'NASDAQ Overview', 'Financial Requirements', 'Cost & Timeline', 'Strategic Fit'],
    relatedGuides: [{ title: 'TSX Listing Guide', slug: 'tsx-vs-nasdaq-listing' }],
    cta: { title: 'Compare Exchanges', description: 'IPOReady helps you evaluate exchange options.', buttonText: 'Exchange Comparison', buttonLink: '/dashboard' }
  },
  'rto-guide': {
    title: 'Reverse Takeover (RTO) Complete Guide',
    description: 'Everything about reverse takeovers. Process, timeline, costs, and when to choose RTO vs IPO.',
    readTime: 16,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'What is an RTO?', content: 'Definition, structure, and how it differs from traditional IPO and SPAC...' },
      { title: 'Finding Shell Companies', content: 'How to identify suitable shell candidates, valuation, and due diligence...' },
      { title: 'RTO Process & Timeline', content: '4-8 month process from shell identification to public trading...' },
      { title: 'RTO Costs & Financing', content: 'Acquisition costs, regulatory costs, and financing considerations...' },
      { title: 'RTO Advantages & Disadvantages', content: 'When RTO is right vs IPO, SPAC, or direct listing...' },
    ],
    toc: ['What is an RTO?', 'Finding Shells', 'Process & Timeline', 'Costs', 'Advantages & Disadvantages'],
    relatedGuides: [{ title: 'IPO vs Direct Listing vs SPAC vs RTO', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' }],
    cta: { title: 'Explore RTO Path', description: 'Is RTO right for your company? Evaluate with IPOReady.', buttonText: 'Assess RTO Option', buttonLink: '/dashboard' }
  },
  'ipo-timeline': {
    title: 'IPO Timeline: How Long Does an IPO Take?',
    description: 'Complete IPO timeline breakdown. Understand each phase, duration (6-12 months), and how to accelerate.',
    readTime: 12,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    sections: [
      { title: 'Phase 1: Preparation', content: '2-3 months of team assembly, advisor selection, and readiness assessment...' },
      { title: 'Phase 2: Documentation', content: '2-3 months of prospectus drafting, financial statement preparation, and audit...' },
      { title: 'Phase 3: Filing & Review', content: '2-4 months of securities commission review and comment responses...' },
      { title: 'Phase 4: Marketing & Pricing', content: '1-2 weeks of investor presentations, pricing, and allocation...' },
      { title: 'Accelerating the Timeline', content: 'Strategies to compress timeline and factors that cause delays...' },
    ],
    toc: ['Preparation Phase', 'Documentation Phase', 'Filing & Review', 'Marketing & Pricing', 'Acceleration Strategies'],
    relatedGuides: [{ title: 'IPO Checklist Canada', slug: 'ipo-checklist-canada' }],
    cta: { title: 'Track Your Timeline', description: 'IPOReady shows you your realistic IPO timeline.', buttonText: 'Start Timeline', buttonLink: '/register' }
  },
  'ipo-readiness-assessment': {
    title: 'IPO Readiness Assessment: Are You Ready?',
    description: 'Self-assessment checklist to determine if your company is ready for an IPO.',
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F6F4' }}>
        <div className="text-center">
          <h1 className="h1 text-nav mb-4">Guide not found</h1>
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
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            IPOReady
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/resources" style={{ color: '#1A1A1A', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', height: '100%' }}>
              Resources
            </Link>
            <Link href="/register" style={{ color: '#FFFFFF', background: '#E8312A', padding: '0.625rem 1.25rem', borderRadius: '9999px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
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
              <BookOpen className="w-5 h-5" style={{ color: '#1D4ED8' }} />
            </div>
            <span className="pill text-xs font-bold uppercase tracking-wider" style={{ background: '#FDECEB', color: '#E8312A' }}>
              {guide.category}
            </span>
          </div>

          <h1 className="serif" style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: '1.2', marginBottom: '1.25rem', color: '#1A1A1A' }}>
            {guide.title}
          </h1>

          <p className="text-lg leading-relaxed" style={{ marginBottom: '2.5rem', color: '#666666', maxWidth: '750px' }}>
            {guide.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-6" style={{ borderBottom: '1px solid #E5E4E0', paddingBottom: '1.5rem' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#9A9A9A' }} />
              <span className="body-sm" style={{ color: '#666666' }}>{guide.readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="body-sm" style={{ color: '#666666' }}>By {guide.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="body-sm" style={{ color: '#9A9A9A' }}>Updated {new Date(guide.updated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: TOC + Content */}
      <section className="max-w-7xl mx-auto" style={{ paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Fixed on Desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-24" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E4E0', padding: '1.5rem' }}>
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                In This Guide
              </h3>
              <div className="space-y-3">
                {guide.toc && guide.toc.map((item: string, idx: number) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="block body-sm hover:opacity-75 transition"
                    style={{ color: '#1D4ED8', textDecoration: 'none' }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Wider */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {guide.sections && guide.sections.map((section: any, idx: number) => (
                <div key={idx} id={`section-${idx}`} className="scroll-mt-24">
                  <h2 className="h3" style={{ marginBottom: '1.25rem', color: '#1A1A1A' }}>
                    {section.title}
                  </h2>
                  <div className="rounded-xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}>
                    <p className="body" style={{ color: '#1A1A1A', lineHeight: '1.8' }}>
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Related Guides */}
            {guide.relatedGuides && guide.relatedGuides.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h2 className="h3 mb-6" style={{ color: '#1A1A1A' }}>
                  Related Guides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guide.relatedGuides.map((related: any, idx: number) => (
                    <Link
                      key={idx}
                      href={`/guides/${related.slug}`}
                      className="group rounded-lg p-6 transition hover:shadow-md"
                      style={{ background: '#FFFFFF', border: '1px solid #E5E4E0' }}
                    >
                      <div className="flex items-start gap-3">
                        <Bookmark className="w-5 h-5 mt-0.5 flex-shrink-0 transition group-hover:scale-110" style={{ color: '#1D4ED8' }} />
                        <div>
                          <h4 className="font-bold mb-1" style={{ color: '#1A1A1A' }}>
                            {related.title}
                          </h4>
                          <p className="body-sm" style={{ color: '#666666' }}>
                            Read related content
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E4E0', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div>
            <h2 className="h2 mb-3" style={{ color: '#1A1A1A' }}>
              {guide.cta.title}
            </h2>
            <p className="body text-lg mb-6" style={{ color: '#666666' }}>
              {guide.cta.description}
            </p>
            <Link
              href={guide.cta.buttonLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition hover:opacity-90"
              style={{ background: '#E8312A' }}
            >
              {guide.cta.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
