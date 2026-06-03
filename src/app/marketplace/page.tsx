'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Shield, Star, Search, X, Send, CheckCircle2, ChevronDown, Sparkles, Edit3 } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

interface RecentListing {
  date: string
  exchange: string
  sector: string
  raise: string
  headline: string
}

interface Provider {
  id: string
  name: string
  category: string
  specialties: string[]
  exchanges: string[]
  experience: string
  priceRange: string
  rating: number
  reviewCount: number
  completedListings: number
  isVisible: boolean
  badge?: string
  recentListings: RecentListing[]
  featured: boolean
  verified: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  'Securities Lawyer': '⚖️',
  'Auditor (CPAB)': '📊',
  'Auditor (PCAOB+CPAB)': '📊',
  'Go-Public Advisor': '🚀',
  'IR Firm': '📣',
  'Independent Director': '🏛️',
  'Transfer Agent': '🔄',
}

const CATEGORIES = ['All', 'Securities Lawyer', 'Auditor (CPAB)', 'Auditor (PCAOB+CPAB)', 'Go-Public Advisor', 'IR Firm', 'Independent Director', 'Transfer Agent']

interface CompanyContext {
  name: string
  exchange: string
  sector: string
  stage: string
  raise: string
  timeline: string
  fiscalYearEnd: string
  jurisdiction: string
}

function getAiDraftInquiry(provider: Provider, ctx: CompanyContext): string {
  const base = `We are ${ctx.name}, a ${ctx.sector} company incorporated in ${ctx.jurisdiction}. We are targeting a ${ctx.exchange} listing and are approximately ${ctx.timeline} from our anticipated listing date, with an anticipated raise of ${ctx.raise}.`

  const roleSpecific: Record<string, string> = {
    'Securities Lawyer': `${base}

We are seeking experienced securities counsel to guide us through the ${ctx.exchange} listing process. Specifically, we need assistance with:
• Prospectus preparation and NI 41-101 compliance
• Escrow and lock-up agreement structuring for insiders
• Continuous disclosure obligations post-listing
• Review of all material contracts for exchange eligibility

Our fiscal year ends ${ctx.fiscalYearEnd}. We have an existing cap table with 6 insiders and 3 investor classes. Do you have capacity to take on a new mandate in Q3 2026?`,

    'Auditor (CPAB)': `${base}

We require a CPAB-registered auditor for our IPO audit cycle. Key details:
• First-time public company audit — no prior public audit history
• Financial statements prepared under IFRS
• Fiscal year end: ${ctx.fiscalYearEnd}
• We anticipate needing 2–3 years of audited financials for our preliminary prospectus
• Exchange target: ${ctx.exchange} (Tier 2 anticipated)

Are you available to begin an audit engagement for FY2025 year-end? Please advise on your experience with ${ctx.sector} issuers and your CPAB registration status.`,

    'Auditor (PCAOB+CPAB)': `${base}

We are a Canadian issuer exploring a dual-listing on ${ctx.exchange} and NASDAQ. We require an auditor registered with both PCAOB and CPAB to ensure our financial statements are accepted by both US and Canadian regulators.

Key needs:
• IFRS to US GAAP conversion capability
• Experience with dual-listed technology issuers
• Fiscal year end: ${ctx.fiscalYearEnd}
• Anticipated raise: ${ctx.raise} (cross-border)

Do you have experience with dual-listed technology companies and capacity for a new mandate?`,

    'Go-Public Advisor': `${base}

We are seeking an experienced go-public advisor to manage our end-to-end listing process on the ${ctx.exchange}. We have already engaged a securities lawyer and are now looking to add a specialist advisor with direct exchange relationships.

Specifically, we need support with:
• Exchange application preparation and liaison
• Listing requirement gap analysis (we are currently at 23% IPO readiness)
• Coordination with auditor, underwriter, and legal counsel
• CPC / direct listing vs. traditional IPO structure analysis

What is your typical timeline and fee structure for a ${ctx.exchange} mandate at our stage?`,

    'IR Firm': `${base}

We are preparing for a ${ctx.exchange} listing and require an experienced investor relations firm to support our pre-IPO and post-listing IR program. Our sector is ${ctx.sector} and our anticipated raise is ${ctx.raise}.

We need:
• Pre-IPO investor targeting and roadshow support
• Ongoing NI 51-102 continuous disclosure program post-listing
• Retail and institutional investor outreach strategy
• Press release drafting and distribution

Do you have current availability for a new IR mandate starting in H2 2026?`,

    'Independent Director': `${base}

We are building our board of directors in preparation for a ${ctx.exchange} listing and are seeking an independent director with relevant public market experience. We require at minimum one financial expert to serve on our Audit Committee per NI 52-110.

We are specifically seeking a director with:
• Experience on ${ctx.sector} company boards
• Familiarity with ${ctx.exchange} governance requirements
• Availability to join the board approximately 12 months before listing
• Ideally, Audit Committee chair capability

Please let us know if you are accepting new board mandates and your typical compensation expectations.`,

    'Transfer Agent': `${base}

We are seeking a CDS-connected transfer agent for our anticipated ${ctx.exchange} listing. Key requirements:
• CDS connectivity for book-entry settlement
• DRS (Direct Registration System) capability
• Experience with ${ctx.exchange} technology issuers
• Shareholder registry management from listing day
• SEDI filing support for insider reporting

Please provide your setup fee structure and ongoing monthly costs for a company of our anticipated size (approximately 10M–15M shares outstanding at listing).`,
  }

  return roleSpecific[provider.category] ?? `${base}\n\nWe are interested in engaging a ${provider.category} for our upcoming ${ctx.exchange} listing. Please advise on your availability and typical fee structure for a company at our stage.`
}

export default function MarketplacePage() {
  const { company } = useAppStore()

  // Build company context for AI draft inquiry — falls back to sensible defaults
  const companyContext: CompanyContext = {
    name: company?.name ?? 'Your Company',
    exchange: company?.targetExchange?.toUpperCase() ?? 'TSXV',
    sector: 'Technology (SaaS)',
    stage: 'Pre-IPO',
    raise: company?.currency === 'USD' ? 'US$10M–$15M' : 'CA$10M–$15M',
    timeline: company?.estimatedDaysToIPO
      ? `~${Math.round(company.estimatedDaysToIPO / 30)} months to listing`
      : '18–24 months to listing',
    fiscalYearEnd: 'December 31',
    jurisdiction: 'Ontario, Canada',
  }

  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterExchange, setFilterExchange] = useState('All')
  const [search, setSearch] = useState('')
  const [inquiryProvider, setInquiryProvider] = useState<Provider | null>(null)
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [isEditingDraft, setIsEditingDraft] = useState(false)
  const [inquirySent, setInquirySent] = useState<string[]>([])
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/marketplace/providers')
      .then(r => r.json())
      .then((data: Provider[]) => { setProviders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = providers.filter(p => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false
    if (filterExchange !== 'All' && !p.exchanges.includes(filterExchange)) return false
    if (search && !p.specialties.some(s => s.toLowerCase().includes(search.toLowerCase())) && !p.category.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openInquiry(provider: Provider) {
    setInquiryProvider(provider)
    setInquiryMessage(getAiDraftInquiry(provider, companyContext))
    setIsEditingDraft(false)
  }

  function sendInquiry() {
    if (!inquiryProvider) return
    setInquirySent(prev => [...prev, inquiryProvider.id])
    setInquiryProvider(null)
    setInquiryMessage('')
    setIsEditingDraft(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" suppressHydrationWarning>

      <div>
        <h1 className="font-display text-3xl font-black mb-1" style={{ color: '#1A1A1A' }}>Expert Network</h1>
        <p className="text-sm" style={{ color: '#9A9A9A' }}>Verified public market professionals. Inquire confidentially.</p>
      </div>

      {/* Credibility notice */}
      <div className="p-5 rounded-xl" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E8312A' }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: '#1A1A1A' }}>Credibility First</p>
            <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>
              Professionals listed on IPOReady are reviewed for demonstrated public market experience and track record.
              IPOReady does not certify, endorse, or warrant any professional's qualifications — always conduct your own due diligence before engaging.
              Names and firms are hidden until you inquire. IPOReady charges a referral fee only when an engagement is confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A9A9A' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by specialty..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #E5E4E0', background: 'white', color: '#1A1A1A' }}
          />
        </div>
        <select
          value={filterExchange} onChange={e => setFilterExchange(e.target.value)}
          className="sm:w-40 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: '1px solid #E5E4E0', background: 'white', color: '#1A1A1A' }}
        >
          <option value="All">All Exchanges</option>
          {['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'OTC'].map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={filterCategory === cat
              ? { background: '#1A1A1A', color: 'white', border: '1px solid #1A1A1A' }
              : { background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }
            }
          >
            {CATEGORY_ICONS[cat] && <span className="mr-1">{CATEGORY_ICONS[cat]}</span>}
            {cat}
            <span className="ml-1" style={{ color: '#B3B3B3' }}>
              ({cat === 'All' ? providers.length : providers.filter(p => p.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      {/* Provider cards */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl animate-pulse" style={{ background: 'white', border: '1px solid #E5E4E0' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full" style={{ background: '#F0EFED' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-24" style={{ background: '#F0EFED' }} />
                  <div className="h-4 rounded w-32" style={{ background: '#F0EFED' }} />
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-5 rounded-full w-14" style={{ background: '#F0EFED' }} />
                ))}
              </div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-5 rounded-full w-12" style={{ background: '#F0EFED' }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-4 rounded w-8 mx-auto" style={{ background: '#F0EFED' }} />
                    <div className="h-3 rounded w-12 mx-auto" style={{ background: '#F0EFED' }} />
                  </div>
                ))}
              </div>
              <div className="h-8 rounded-xl mt-auto" style={{ background: '#F0EFED' }} />
            </div>
          ))}
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ display: loading ? 'none' : undefined }}>
        {filtered.map((provider, i) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl relative flex flex-col"
            style={{ background: 'white', border: '1px solid #E5E4E0' }}
          >
            {provider.badge && (
              <div className="absolute top-3 right-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: '#FEF3C7', color: '#B45309' }}>{provider.badge}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                {CATEGORY_ICONS[provider.category] || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Lock className="w-3.5 h-3.5" style={{ color: '#B3B3B3' }} />
                  <span className="text-xs" style={{ color: '#B3B3B3' }}>Identity protected</span>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{provider.category}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {provider.specialties.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#717171' }}>{s}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {provider.exchanges.map(ex => (
                <span key={ex} className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#F0F4FF', border: '1px solid #DBEAFE', color: '#1D4ED8' }}>{ex}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div>
                <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{provider.completedListings}</p>
                <p className="text-xs" style={{ color: '#9A9A9A' }}>Listings</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{provider.rating}</p>
                </div>
                <p className="text-xs" style={{ color: '#9A9A9A' }}>Rating</p>
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{provider.experience.split(' ')[0]}</p>
                <p className="text-xs" style={{ color: '#9A9A9A' }}>Experience</p>
              </div>
            </div>

            <p className="text-xs mb-4" style={{ color: '#9A9A9A' }}>
              Typical fees: <span className="font-medium" style={{ color: '#1A1A1A' }}>{provider.priceRange}</span>
            </p>

            {/* Recent Listings toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); setExpandedNewsId(expandedNewsId === provider.id ? null : provider.id) }}
              className="w-full flex items-center justify-between py-2 text-xs font-medium transition-colors mb-3"
              style={{ color: expandedNewsId === provider.id ? '#1A1A1A' : '#9A9A9A', borderTop: '1px solid #F0EFED', paddingTop: '0.625rem' }}>
              <span>Recent Transactions ({provider.recentListings.length})</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: expandedNewsId === provider.id ? 'rotate(180deg)' : 'none' }} />
            </button>

            {expandedNewsId === provider.id && (
              <div className="mb-3 space-y-2">
                {provider.recentListings.map((listing, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{listing.exchange}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' }}>{listing.sector}</span>
                      {listing.raise !== 'N/A' && (
                        <span className="text-[10px] font-semibold ml-auto" style={{ color: '#15803D' }}>{listing.raise}</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#717171' }}>{listing.headline}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#B3B3B3' }}>{listing.date}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto">
              {inquirySent.includes(provider.id) ? (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm"
                  style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D' }}>
                  <CheckCircle2 className="w-4 h-4" /> Inquiry Sent
                </div>
              ) : (
                <button
                  onClick={() => openInquiry(provider)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: '#1A1A1A', color: 'white' }}
                >
                  <Send className="w-3.5 h-3.5" /> Inquire Confidentially
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inquiry modal */}
      <AnimatePresence>
        {inquiryProvider && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
              style={{ background: 'white', border: '1px solid #E5E4E0' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-5" style={{ borderBottom: '1px solid #F0EFED' }}>
                <div>
                  <h2 className="font-bold text-xl" style={{ color: '#1A1A1A' }}>Confidential Inquiry</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#9A9A9A' }}>Review your AI-drafted message before sending</p>
                </div>
                <button onClick={() => setInquiryProvider(null)} style={{ color: '#9A9A9A' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-7 py-5" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Provider info */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'white', border: '1px solid #E5E4E0' }}>
                    {(['Securities Lawyer', 'Auditor (CPAB)', 'Auditor (PCAOB+CPAB)'].includes(inquiryProvider.category) ? '⚖️📊'[['Securities Lawyer'].includes(inquiryProvider.category) ? 0 : 2] : '🚀')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{inquiryProvider.category}</p>
                    <p className="text-xs truncate" style={{ color: '#717171' }}>{inquiryProvider.specialties.join(' · ')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9A9A9A' }}>
                    <Lock className="w-3 h-3" />
                    Identity protected
                  </div>
                </div>

                {/* AI Draft label */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                      <Sparkles className="w-3 h-3" style={{ color: '#7C3AED' }} />
                      <span className="text-[10px] font-bold" style={{ color: '#7C3AED' }}>AI-Drafted for You</span>
                    </div>
                    <span className="text-xs" style={{ color: '#9A9A9A' }}>Based on your company profile</span>
                  </div>
                  <button
                    onClick={() => setIsEditingDraft(!isEditingDraft)}
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: isEditingDraft ? '#E8312A' : '#1A1A1A' }}>
                    <Edit3 className="w-3 h-3" />
                    {isEditingDraft ? 'Lock Draft' : 'Edit Draft'}
                  </button>
                </div>

                {/* Message */}
                {isEditingDraft ? (
                  <textarea
                    value={inquiryMessage} onChange={e => setInquiryMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-xs outline-none resize-none"
                    style={{ border: '1px solid #1A1A1A', background: '#FAFAFA', color: '#1A1A1A', lineHeight: '1.6', minHeight: '280px', fontFamily: 'inherit', boxShadow: '0 0 0 3px rgba(26,26,26,0.07)' }}
                  />
                ) : (
                  <div className="rounded-xl p-4" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', position: 'relative' }}>
                    <pre className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#1A1A1A', fontFamily: 'inherit', margin: 0 }}>
                      {inquiryMessage}
                    </pre>
                  </div>
                )}

                {/* Privacy notice */}
                <div className="p-3 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#0369A1' }}>
                    <strong>Anonymous send:</strong> Your company name is withheld until both parties agree to connect. The professional will review and respond within 48 hours. IPOReady charges a referral fee only if an engagement is confirmed.
                  </p>
                </div>

              </div>

              {/* Footer actions */}
              <div className="flex gap-3 px-7 pb-7">
                <button onClick={() => setInquiryProvider(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', color: '#1A1A1A' }}>
                  Cancel
                </button>
                <button onClick={sendInquiry}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#1A1A1A', color: 'white' }}>
                  <Send className="w-4 h-4" /> Send Inquiry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
