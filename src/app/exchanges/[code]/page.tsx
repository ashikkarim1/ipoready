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
      { q: 'What are the financial requirements for TSX?', a: 'TSX requires companies to demonstrate profitability or a realistic path to profitability. Specific thresholds include: minimum $2M-$4M public float, positive earnings in at least one of the past two years (or strong evidence of sustainable profitability), and minimum book value. Revenue requirements typically range from $5M-$10M annually, though this varies by industry. The exchange also requires 3+ years of continuous business operations with audited financial statements prepared under IFRS or GAAP.' },
      { q: 'How long does TSX listing take?', a: 'The typical TSX listing timeline spans 6-12 months from initial decision to trading commencement. The process breaks down as: pre-filing phase (2-3 months for assembling advisors and preparing documents), filing phase (2-3 months for prospectus and supporting documents), TSX review period (2-4 months for TSX and provincial securities commissions to review and request comments), and final closing (2-4 weeks for final preparations and pricing). Delays can extend timelines if TSX raises material concerns requiring significant revisions.' },
      { q: 'What is the difference between TSX and TSXV?', a: 'TSX is Canada\'s primary exchange for established, profitable companies, while TSXV (TSX Venture Exchange) targets growth-stage and emerging companies. TSX typically requires profitability and 3+ years of operations, whereas TSXV accepts companies with strong growth potential but minimal history. TSX listings attract institutional investors and larger capital raises ($50M+), while TSXV focuses on smaller companies ($5M-$50M raises). TSXV has lighter regulatory requirements, faster listing timelines (4-8 months), and lower costs ($300K-$1M vs $500K-$2M for TSX), but trades at lower valuations with smaller investor base.' },
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
    faq: [
      { q: 'What are the minimum financial requirements for TSXV?', a: 'TSXV has minimal financial requirements compared to TSX. Companies typically need: minimum $100K-$500K in working capital, audited or reviewed financial statements for recent years (not necessarily profitable), and demonstrated business plan or proof of concept. Unlike TSX, TSXV does NOT require profitability. The exchange focuses on growth potential rather than current earnings, making it ideal for tech startups, mineral exploration companies, and development-stage businesses with strong market opportunity.' },
      { q: 'How much capital can I raise on TSXV?', a: 'TSXV listings typically raise between $5M-$50M, though smaller offerings ($500K-$5M) are common for emerging companies. Most TSXV IPOs raise $10M-$30M. Capital raise size depends on business stage, investor interest, and company valuation. TSXV attracts retail investors and early-stage venture capital, but rarely attracts the mega-cap institutional money available on TSX. Post-listing secondary offerings and financings are common as TSXV companies grow toward TSX graduation.' },
      { q: 'Can I move from TSXV to TSX later?', a: 'Yes - TSXV serves as a "stepping stone" exchange. Successful TSXV companies frequently graduate to TSX once they meet profitability and size requirements (typically $10M+ revenue, positive earnings, $50M+ market cap). The transition takes 2-4 months and involves submitting a new application to TSX demonstrating improved financial metrics. Many companies use TSXV to build investor base, prove business model, and establish trading history before graduating to TSX for larger capital raises and broader institutional reach.' },
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
    faq: [
      { q: 'Why is CSE faster than TSX/TSXV?', a: 'CSE offers the fastest Canadian listing timeline (2-4 months) because it uses a streamlined regulator approval process. Unlike TSX which requires provincial securities commission review, CSE operates under Ontario-only regulation, eliminating multi-province coordination delays. CSE also has lighter financial documentation requirements and less stringent profitability standards. The exchange focuses on capital efficiency and faster time-to-market, accepting companies with shorter operating histories and minimal financial track records that TSXV would require more documentation for.' },
      { q: 'What is the minimum funding needed for CSE listing?', a: 'CSE requires minimum $75K-$150K in working capital (significantly lower than TSXV\'s $300K-$500K). Most CSE listings raise $1M-$20M, though some raise as little as $500K. CSE does NOT require audited financial statements if the company has been operating less than 2 years. This makes CSE ideal for early-stage companies, startups, and businesses needing quick capital access without extensive financial history. The lower requirements mean faster approval but potentially lower valuations and smaller investor base.' },
      { q: 'Is CSE recognized by major investors?', a: 'CSE has growing recognition among retail investors and is increasingly accepted by institutional investors, though it trades at a discount to TSX/TSXV listings. CSE provides good price discovery and liquidity for small-cap companies ($5M-$100M market cap), but lacks the institutional credibility of TSX. Many fast-growing CSE companies graduate to TSXV/TSX within 2-3 years after proving business model and growth metrics. CSE is ideal for companies prioritizing quick market access and capital raising over immediate institutional investor appeal.' },
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
    faq: [
      { q: 'What are NASDAQ financial requirements?', a: 'NASDAQ has multiple listing standards (Tier 1 and Tier 2). Standard requirements include: $110M market cap OR $90M revenues OR $60M market cap + $27.5M revenues, positive net income of $11M in last fiscal year or $2.2M in last 3 years, minimum $45M public float (shares held by non-affiliates), and minimum $100M trading volume. Companies must also have 400+ public shareholders, $1 minimum bid price, and meet corporate governance standards including independent board committees. NASDAQ accepts profitable and growth-stage tech companies with strong revenue trajectories.' },
      { q: 'Why do tech companies choose NASDAQ?', a: 'NASDAQ is known as the "tech exchange" and attracts technology, biotech, and growth companies globally. Key advantages: 40% of global tech IPOs list on NASDAQ, high valuation multiples (3-5x revenue vs 1-2x on TSX/NYSE), strong institutional investor base focused on growth, and high trading liquidity attracting day traders and momentum investors. NASDAQ also offers strong visibility for tech acquisitions and secondary financing. Ticker symbols (4-5 letters vs 1-3 on NYSE) are easier to remember and market.' },
      { q: 'Can Canadian companies list on NASDAQ?', a: 'Yes - Canadian companies frequently list on NASDAQ, either as primary listing or dual-listing alongside TSX. Dual-listing (both exchanges) is common for large Canadian tech companies seeking US institutional capital while maintaining Canadian investor access. Companies must comply with SEC regulations, NASDAQ listing standards, and cross-border securities laws. Many Canadian companies list on NASDAQ for technology companies targeting US venture capital, SaaS companies serving North American markets, or biotech firms needing US regulatory credibility. Total listing costs are typically $1.5M-$3M (higher than TSX but justified by US market access).' },
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
    faq: [
      { q: 'What are NYSE financial requirements?', a: 'NYSE requires higher thresholds than NASDAQ: $100M market cap OR $100M revenues, $2M positive net income (last fiscal year or average of last 3 years), minimum $110M public float, 2,000+ public shareholders, $100M trading volume, and $4 minimum bid price. Additionally, companies must demonstrate $2M working capital if unprofitable, meet stringent corporate governance standards, and have diverse board with independent audit/compensation committees. NYSE focuses on established, profitable companies with proven business models and strong financial performance.' },
      { q: 'How is NYSE different from NASDAQ?', a: 'NYSE is the world\'s largest exchange by market cap ($30T+ vs NASDAQ $20T+), attracting large established companies and multinational corporations. NYSE emphasizes stability, profitability, and corporate governance over growth potential. Listings tend to be older, larger companies (Financial Services, Healthcare, Industrials) compared to NASDAQ\'s tech/growth focus. Ticker symbols are 1-3 letters on NYSE vs 4-5 on NASDAQ. Trading is traditionally floor-based (though electronic now). Valuations on NYSE tend to be more conservative (lower multiples) reflecting mature business profiles.' },
      { q: 'Why would a company choose NYSE over NASDAQ?', a: 'NYSE is preferred by: mature, profitable companies wanting stability/prestige (NYSE perceived as more established), industrial/financial/pharma companies (less tech-focused investor base), international companies seeking US credibility, and companies targeting conservative institutional investors (pensions, funds). NYSE listing provides strong brand recognition globally and attracts long-term buy-and-hold investors. Downsides include stricter profitability requirements (harder for growth-stage), higher costs ($2M-$5M vs $1M-$3M for NASDAQ), and longer timeline. Most high-growth companies prefer NASDAQ for faster path and higher multiples.' },
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
    faq: [
      { q: 'What are OTC Markets requirements?', a: 'OTC Markets have minimal requirements - no minimum revenue, profitability, or market cap thresholds. Companies need SEC pink sheet registration, proof of business operations, and compliant financial statements (no formal audit required). Essentially any operating company can trade OTC. However, OTC Markets ranks companies in tiers (OTC Pink Current, OTC Pink Limited, and OTC Pink No Information), and "Pink Current" (most legitimate) requires regular SEC filings. This makes OTC fastest and cheapest path to public trading but attracts higher risk perception.' },
      { q: 'Why would companies use OTC Markets?', a: 'OTC is chosen for: extremely fast time-to-trading (1-2 weeks vs 2-12 months on major exchanges), minimal costs ($10K-$50K vs $500K+ on TSX), SPAC shells seeking merger targets, companies emerging from bankruptcy, delisted companies, and very early-stage businesses needing capital access. OTC provides legitimate trading infrastructure without major exchange scrutiny. However, OTC stocks face liquidity challenges, manipulation risks, wider bid-ask spreads, and poor institutional investor access. Most OTC companies eventually graduate to NASDAQ/TSX as they mature and professionalize.' },
      { q: 'Is OTC trading safe for investors?', a: 'OTC Markets are riskier than major exchanges due to: minimal disclosure requirements, higher potential for fraud/manipulation, limited regulatory oversight, low liquidity (hard to buy/sell), and wide price swings. Legitimate companies trade OTC as stepping stones (SPAC mergers, restructurings) or as temporary cost-saving measures before graduating to major exchanges. Investors should focus on "Pink Current" OTC companies with regular SEC filings and clear business models. Many "penny stocks" trade OTC with questionable fundamentals - due diligence is critical.' },
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
    faq: [
      { q: 'How does Cboe Canada compare to TSX/TSXV?', a: 'Cboe Canada is a newer Canadian exchange offering middle-ground between CSE and TSXV. Requirements: minimum $500K working capital (vs $300K for TSXV, $100K for CSE), demonstrated revenue/business model (less stringent than TSX), and lighter governance than TSXV. Cboe lists primarily Canadian growth companies, technology companies, and some emerging companies. Listing timeline (4-6 months) is faster than TSX/TSXV but slower than CSE. Costs ($250K-$800K) fall between CSE and TSXV. Cboe provides alternative to TSXV while maintaining Canadian credibility for serious growth companies.' },
      { q: 'What size raises typically happen on Cboe Canada?', a: 'Cboe Canada listings typically raise $5M-$50M, similar to TSXV. Average raise is $15M-$30M. Companies target Canadian institutional investors, high-net-worth individuals, and some US venture capital. Cboe attracts companies that don\'t meet TSX profitability standards but want more credibility than CSE. Post-listing financing is common as Cboe companies grow toward TSXV or TSX graduation. Cboe also allows smaller companies ($500K-$5M raises) seeking Canadian capital without TSX/TSXV complexity.' },
      { q: 'Can I graduate from Cboe to TSXV/TSX?', a: 'Yes - Cboe serves similar function as CSE/TSXV as stepping stone exchange. Companies typically graduate to TSXV (2-3 years) by demonstrating stronger financials, consistent revenue growth, and profitability path. Graduation requires new TSXV application, typically taking 2-3 months. Cboe provides valuable intermediate step for companies that want Canadian credibility beyond CSE but aren\'t ready for TSXV\'s heavier requirements. Market conditions, investor interest, and financial performance drive graduation timing.' },
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
