'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Lock, ChevronRight, ChevronDown, ChevronUp,
  AlertTriangle, Info, CheckCircle, ArrowRight, RotateCcw,
  DollarSign, Users, Building2, Zap, Globe, FileText,
  ShieldCheck, Percent, Calendar, BarChart2, Award, Banknote
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'pre_revenue' | 'early_revenue' | 'growth' | 'mature'
type RaiseAmount = 'under_500k' | '500k_2m' | '2m_10m' | '10m_25m' | '25m_plus'
type UseOfFunds = 'working_capital' | 'product_dev' | 'market_expansion' | 'acquisition' | 'pre_ipo_bridge' | 'other'
type DebtComfort = 'yes' | 'maybe' | 'no'
type Timeline = 'immediate' | 'near_term' | 'planning' | 'exploratory'
type BurnRate = 'under_50k' | '50k_200k' | '200k_500k' | '500k_plus'

interface Profile {
  stage: Stage | null
  raiseAmount: RaiseAmount | null
  useOfFunds: UseOfFunds | null
  debtComfort: DebtComfort | null
  timeline: Timeline | null
  burnRate: BurnRate | null
  hasInstitutional: boolean | null
}

interface Instrument {
  id: string
  icon: React.ElementType
  title: string
  category: 'equity' | 'debt' | 'hybrid' | 'non_dilutive' | 'public'
  tagline: string
  typicalRange: string
  description: string
  whatInvestorsLookFor: string[]
  benefits: string[]
  considerations: string[]
  capTableImpact: string
  controlImpact: string
  typicalTimeline: string
  relevantStages: Stage[]
  relevantAmounts: RaiseAmount[]
  debtRequired: boolean
}

const INSTRUMENTS: Instrument[] = [
  {
    id: 'common_equity',
    icon: Users,
    title: 'Common Share Offering',
    category: 'equity',
    tagline: 'Friends, family, and angel investors',
    typicalRange: '$25K – $1M',
    description: 'Selling common shares directly to individuals — typically founders\' networks, angel investors, or early believers. Often the first external capital raised.',
    whatInvestorsLookFor: [
      'Founder conviction and coachability',
      'Clear problem being solved with a defined market',
      'Some evidence of early traction or customer conversations',
      'Reasonable valuation relative to stage',
      'Clear explanation of how funds will be used',
    ],
    benefits: [
      'Relatively fast to close with aligned individuals',
      'No fixed repayment obligation',
      'Investors often provide advice, introductions, and credibility',
      'Flexible terms negotiated directly',
    ],
    considerations: [
      'Permanent dilution to existing shareholders',
      'Requires securities exemptions (accredited investor, friends & family) in most jurisdictions',
      'Valuation can be contentious at very early stages',
      'May create a large number of small shareholders, complicating future governance',
    ],
    capTableImpact: 'Moderate — dilutes all existing common shareholders proportionally',
    controlImpact: 'Low — common shares rarely carry special voting rights',
    typicalTimeline: '1 – 3 months',
    relevantStages: ['pre_revenue', 'early_revenue'],
    relevantAmounts: ['under_500k', '500k_2m'],
    debtRequired: false,
  },
  {
    id: 'preferred_equity',
    icon: Award,
    title: 'Preferred Share Offering',
    category: 'equity',
    tagline: 'Venture capital and institutional investors',
    typicalRange: '$1M – $50M+',
    description: 'Issuing preferred shares — a class with priority rights over common shares — typically to venture capital firms or institutional investors in a formal round (Series A, B, etc.).',
    whatInvestorsLookFor: [
      'Demonstrated product-market fit or strong early signals',
      'A scalable, defensible business model',
      'A strong, complete founding team',
      'Large addressable market ($100M+ TAM)',
      'Clear path to the return multiple they need (typically 10x+)',
      'Clean cap table and corporate structure',
    ],
    benefits: [
      'Access to significant capital and institutional credibility',
      'VCs often provide strategic value, board experience, and network',
      'No fixed repayment — aligned on growth',
      'Signals validation to future investors and partners',
    ],
    considerations: [
      'Significant dilution, often 15–30% per round',
      'Preferred shares carry liquidation preferences that may reduce common holder proceeds',
      'Board seats and protective provisions transfer meaningful control',
      'Anti-dilution provisions in down rounds can be punishing',
      'Lengthy due diligence process (1–6 months)',
    ],
    capTableImpact: 'Significant — new share class with priority rights created',
    controlImpact: 'High — board seats, protective provisions, information rights standard',
    typicalTimeline: '3 – 9 months',
    relevantStages: ['early_revenue', 'growth', 'mature'],
    relevantAmounts: ['2m_10m', '10m_25m', '25m_plus'],
    debtRequired: false,
  },
  {
    id: 'safe_note',
    icon: FileText,
    title: 'SAFE Note',
    category: 'hybrid',
    tagline: 'Simple Agreement for Future Equity',
    typicalRange: '$50K – $2M',
    description: 'A SAFE (Simple Agreement for Future Equity) is not a loan — it\'s a contract giving investors the right to receive equity in a future priced round, typically at a discount or with a valuation cap.',
    whatInvestorsLookFor: [
      'Early-stage conviction in the team and idea',
      'Reasonable valuation cap relative to current traction',
      'Clear plan to raise a priced round within 12–24 months',
      'Transparent use of proceeds',
    ],
    benefits: [
      'Fast and low-cost to execute (standardized YC-style documents)',
      'No immediate dilution or valuation negotiation',
      'No interest accrual or maturity date (unlike convertible notes)',
      'Allows company to start deploying capital quickly',
    ],
    considerations: [
      'Dilution is deferred but not avoided — converts at a discount in the next round',
      'Valuation cap can create misaligned incentives if the company scales dramatically',
      'Multiple SAFEs with different caps can create complex cap table dynamics',
      'No automatic conversion event if a priced round is never raised',
    ],
    capTableImpact: 'Deferred — no immediate dilution; converts to equity at next priced round',
    controlImpact: 'Minimal until conversion — no board rights, no voting until converted',
    typicalTimeline: '1 – 6 weeks',
    relevantStages: ['pre_revenue', 'early_revenue'],
    relevantAmounts: ['under_500k', '500k_2m'],
    debtRequired: false,
  },
  {
    id: 'convertible_note',
    icon: RotateCcw,
    title: 'Convertible Note',
    category: 'hybrid',
    tagline: 'Bridge financing that converts to equity',
    typicalRange: '$250K – $5M',
    description: 'A convertible note is a short-term debt instrument that converts into equity upon a qualifying financing event or at maturity. It carries interest and a maturity date.',
    whatInvestorsLookFor: [
      'Clear path to a priced equity round before maturity',
      'Sufficient runway to reach conversion milestones',
      'Reasonable discount rate (15–25%) and valuation cap',
      'Existing investor support and cap table hygiene',
    ],
    benefits: [
      'Faster to execute than a full priced equity round',
      'Delays valuation conversation until a larger round',
      'Commonly used as bridge between rounds with known investors',
      'Can signal confidence when done with strategic insiders',
    ],
    considerations: [
      'Carries interest (typically 5–8% per annum)',
      'Maturity date creates a hard deadline — must raise or repay',
      'If not converted, the company must repay principal + interest',
      'Multiple notes with different terms complicate future financing',
    ],
    capTableImpact: 'Deferred — converts to equity at next qualifying round, typically at discount',
    controlImpact: 'Minimal while outstanding — becomes equity control at conversion',
    typicalTimeline: '2 – 8 weeks',
    relevantStages: ['early_revenue', 'growth'],
    relevantAmounts: ['under_500k', '500k_2m', '2m_10m'],
    debtRequired: false,
  },
  {
    id: 'venture_debt',
    icon: TrendingUp,
    title: 'Venture Debt / Term Loan',
    category: 'debt',
    tagline: 'Non-dilutive debt for venture-backed companies',
    typicalRange: '$1M – $20M',
    description: 'Venture debt is a loan product offered to venture-backed companies, typically alongside or shortly after an equity round, to extend runway without additional dilution. Often includes warrants.',
    whatInvestorsLookFor: [
      'Reputable institutional equity investors already on cap table',
      'Evidence of recurring revenue or contracted cash flows',
      'Clear use of proceeds tied to revenue-generating activities',
      'Runway sufficient to service debt or raise the next equity round',
    ],
    benefits: [
      'Extends runway without proportionate dilution',
      'Often 20–35% of the most recent equity round in size',
      'Faster than equity rounds once lender relationship established',
      'Preserves equity for higher-value milestones',
    ],
    considerations: [
      'Fixed interest payments (typically 8–14% annually) require cash flow discipline',
      'Warrants issued to lenders create some dilution',
      'Default events can accelerate repayment or give lenders board observer rights',
      'Covenant packages can restrict operational flexibility',
    ],
    capTableImpact: 'Low — warrants typically represent <1–2% fully diluted',
    controlImpact: 'Moderate — covenants, material adverse change clauses, possible board observer',
    typicalTimeline: '1 – 3 months',
    relevantStages: ['growth', 'mature'],
    relevantAmounts: ['2m_10m', '10m_25m'],
    debtRequired: true,
  },
  {
    id: 'bank_credit',
    icon: Building2,
    title: 'Bank Credit Facility / Line of Credit',
    category: 'debt',
    tagline: 'Traditional lending against assets or receivables',
    typicalRange: '$100K – $10M+',
    description: 'Traditional bank debt, including revolving lines of credit (drawn as needed) or term loans secured against assets, receivables, or personal guarantees.',
    whatInvestorsLookFor: [
      'Demonstrable revenue (typically 12+ months of history)',
      'Positive or near-positive EBITDA or clear path to it',
      'Hard assets or receivables to secure against',
      'Detailed financial projections with conservative assumptions',
    ],
    benefits: [
      'No equity dilution',
      'Interest is typically tax-deductible',
      'Revolving credit provides flexible access to capital',
      'Establishes banking relationship for future growth',
    ],
    considerations: [
      'Requires collateral or personal guarantees in most cases',
      'Revenue and profitability history typically required',
      'Covenants may restrict dividends, acquisitions, or other debt',
      'Slow approval process (2–6 months for new relationships)',
    ],
    capTableImpact: 'None — debt instrument with no equity component',
    controlImpact: 'Low to moderate — financial covenants, no board representation typically',
    typicalTimeline: '1 – 6 months',
    relevantStages: ['growth', 'mature'],
    relevantAmounts: ['under_500k', '500k_2m', '2m_10m'],
    debtRequired: true,
  },
  {
    id: 'revenue_based',
    icon: BarChart2,
    title: 'Revenue-Based Financing',
    category: 'debt',
    tagline: 'Repayment tied to a percentage of revenue',
    typicalRange: '$100K – $5M',
    description: 'An investor provides capital in exchange for a fixed percentage of monthly gross revenue until a specified repayment cap (typically 1.3x–2.5x the original advance) is reached.',
    whatInvestorsLookFor: [
      'Consistent monthly recurring revenue (MRR) of $25K–$500K+',
      'Gross margins above 40–50%',
      'Low customer churn and predictable revenue mix',
      'SaaS, e-commerce, or subscription business models',
    ],
    benefits: [
      'No equity dilution and no fixed repayment schedule',
      'Repayments flex with revenue — slower months mean smaller payments',
      'Faster approval than traditional bank debt',
      'No personal guarantees in most structures',
    ],
    considerations: [
      'Effective annualized cost can be high (20–50%) depending on repayment speed',
      'Revenue diversion reduces cash available for operations',
      'Not suitable for pre-revenue or highly lumpy revenue businesses',
      'Multiple facilities can create compounding revenue obligations',
    ],
    capTableImpact: 'None — revenue share, not equity',
    controlImpact: 'Low — no board rights, but revenue covenants may apply',
    typicalTimeline: '2 – 6 weeks',
    relevantStages: ['early_revenue', 'growth'],
    relevantAmounts: ['under_500k', '500k_2m', '2m_10m'],
    debtRequired: true,
  },
  {
    id: 'government_grants',
    icon: ShieldCheck,
    title: 'Government Grants & Programs',
    category: 'non_dilutive',
    tagline: 'SR&ED, IRAP, BDC, EDC, and provincial programs',
    typicalRange: '$10K – $5M+ (non-dilutive)',
    description: 'Government-backed programs offering grants, tax credits, or concessionary loans to eligible businesses. In Canada, key programs include SR&ED tax credits, IRAP, BDC financing, and various provincial innovation funds.',
    whatInvestorsLookFor: [
      'Eligible R&D activities (SR&ED) with documented technical uncertainty',
      'Canadian-controlled private corporation (CCPC) status for maximum SR&ED rates',
      'SME status and innovation mandate for IRAP',
      'Export or growth orientation for BDC/EDC programs',
    ],
    benefits: [
      'No dilution — grants and tax credits are non-repayable',
      'Can be layered with other financing sources',
      'SR&ED refundable credits can provide significant recurring cash',
      'Validates R&D activity for future investor due diligence',
    ],
    considerations: [
      'Application processes can be lengthy (2–12 months)',
      'Strict eligibility criteria — not all activities qualify',
      'Clawback provisions if milestones are not met on grant funding',
      'SR&ED claims require detailed documentation and may be audited',
    ],
    capTableImpact: 'None — non-dilutive',
    controlImpact: 'Low — reporting requirements and milestone tracking, no equity involvement',
    typicalTimeline: '2 – 12 months depending on program',
    relevantStages: ['pre_revenue', 'early_revenue', 'growth'],
    relevantAmounts: ['under_500k', '500k_2m'],
    debtRequired: false,
  },
  {
    id: 'strategic_investment',
    icon: Globe,
    title: 'Strategic / Corporate Investment',
    category: 'equity',
    tagline: 'Investment from a corporate partner or customer',
    typicalRange: '$500K – $20M+',
    description: 'A strategic investor — typically a large corporation in your industry — invests capital in exchange for equity, often alongside a commercial partnership, distribution agreement, or technology licensing arrangement.',
    whatInvestorsLookFor: [
      'Genuine strategic fit and synergy with their core business',
      'Technology, IP, or market access they cannot easily replicate',
      'A management team they can work closely with',
      'Clear commercial deal alongside or in conjunction with investment',
    ],
    benefits: [
      'Capital plus strategic value (distribution, customers, technology access)',
      'Credibility signal to other investors and customers',
      'May lead to acquisition or licensing deal over time',
      'Industry expertise and network of the corporate partner',
    ],
    considerations: [
      'Exclusivity provisions can restrict future strategic options',
      'Right of first refusal on acquisition can deter other suitors',
      'Corporate venture arms move slowly and have internal approval requirements',
      'Misalignment of return timelines (corporate vs. VC vs. founder)',
    ],
    capTableImpact: 'Moderate — depends on negotiated stake, typically 5–20%',
    controlImpact: 'Variable — can include information rights, board observer, or veto rights',
    typicalTimeline: '3 – 9 months',
    relevantStages: ['early_revenue', 'growth', 'mature'],
    relevantAmounts: ['500k_2m', '2m_10m', '10m_25m'],
    debtRequired: false,
  },
  {
    id: 'private_placement',
    icon: Percent,
    title: 'Private Placement',
    category: 'equity',
    tagline: 'Securities offering to qualified investors without full prospectus',
    typicalRange: '$500K – $25M+',
    description: 'A private placement raises capital by selling securities to a defined group of accredited or institutional investors under exemptions from full prospectus requirements (NI 45-106 in Canada, Regulation D in the US).',
    whatInvestorsLookFor: [
      'Clear and defensible valuation methodology',
      'Experienced management team with relevant track records',
      'Strong financial projections with assumptions the investor can validate',
      'Exit strategy and liquidity path within 3–7 years',
    ],
    benefits: [
      'Can raise significant capital without a full public offering',
      'Faster and less expensive than an IPO',
      'Wide range of potential investors (HNW individuals, family offices, funds)',
      'Confidential — no public disclosure required in most jurisdictions',
    ],
    considerations: [
      'Securities are subject to resale restrictions (hold periods)',
      'Requires securities counsel and proper documentation',
      'Investors expect liquidity event within defined timeframe',
      'Selling costs (agents, finders) can be 5–10% of raise',
    ],
    capTableImpact: 'Significant — new shareholders added; dilutes existing holders',
    controlImpact: 'Moderate — depends on share class and investor protections negotiated',
    typicalTimeline: '2 – 5 months',
    relevantStages: ['early_revenue', 'growth', 'mature'],
    relevantAmounts: ['500k_2m', '2m_10m', '10m_25m', '25m_plus'],
    debtRequired: false,
  },
  {
    id: 'ipo_public',
    icon: Zap,
    title: 'Public Market Capital (IPO / RTO / SPAC)',
    category: 'public',
    tagline: 'The ultimate capital raise — going public',
    typicalRange: '$2M – $500M+ (exchange dependent)',
    description: 'Raising capital through a public offering on a stock exchange — via a traditional IPO, Reverse Takeover (RTO), or SPAC merger. This is the primary goal of the IPOReady platform.',
    whatInvestorsLookFor: [
      'Exchange-specific financial thresholds (e.g., TSXV: $2M minimum pre-IPO working capital)',
      'Audited financial statements (2–3 years depending on exchange)',
      'Experienced and credible board of directors with public company experience',
      'Credible use of proceeds with identifiable milestones',
      'Sponsor/underwriter willing to back the offering',
    ],
    benefits: [
      'Access to the broadest possible pool of capital',
      'Provides liquidity for existing shareholders and founders',
      'Enhanced credibility, brand, and ability to attract talent',
      'Public currency for M&A activity',
    ],
    considerations: [
      'Significant legal, accounting, and regulatory costs ($500K–$2M+)',
      'Ongoing continuous disclosure obligations (quarterly, annual filings)',
      'Management time diverted to investor relations and reporting',
      'Market windows — poor conditions can delay or kill an offering',
    ],
    capTableImpact: 'Significant — public float created; existing holders\' shares become liquid',
    controlImpact: 'High — public shareholders, regulatory obligations, board independence requirements',
    typicalTimeline: '9 – 24 months from start to listing',
    relevantStages: ['growth', 'mature'],
    relevantAmounts: ['2m_10m', '10m_25m', '25m_plus'],
    debtRequired: false,
  },
]

const QUESTIONS = [
  {
    key: 'stage' as keyof Profile,
    question: 'What stage is your company currently at?',
    context: 'This helps us show you which instruments are realistically available to you right now.',
    options: [
      { value: 'pre_revenue', label: 'Pre-Revenue', desc: 'Idea or product in development, no commercial sales yet' },
      { value: 'early_revenue', label: 'Early Revenue', desc: 'Some paying customers, under $1M annual revenue' },
      { value: 'growth', label: 'Growth Stage', desc: '$1M – $10M ARR, demonstrable traction' },
      { value: 'mature', label: 'Growth / Pre-IPO', desc: '$10M+ ARR, scaling operations, considering a listing' },
    ],
  },
  {
    key: 'raiseAmount' as keyof Profile,
    question: 'How much capital are you looking to raise?',
    context: 'Be realistic — raise what you need for 18–24 months of runway, not what sounds impressive.',
    options: [
      { value: 'under_500k', label: 'Under $500K', desc: 'Seed / pre-seed round' },
      { value: '500k_2m', label: '$500K – $2M', desc: 'Seed or early Series A' },
      { value: '2m_10m', label: '$2M – $10M', desc: 'Series A or growth round' },
      { value: '10m_25m', label: '$10M – $25M', desc: 'Series B or pre-IPO round' },
      { value: '25m_plus', label: '$25M+', desc: 'Large growth round or IPO-scale financing' },
    ],
  },
  {
    key: 'useOfFunds' as keyof Profile,
    question: 'What is the primary use of the funds you\'re raising?',
    context: 'Investors and lenders evaluate risk differently based on how capital will be deployed.',
    options: [
      { value: 'working_capital', label: 'Working Capital', desc: 'Operational needs, payroll, inventory' },
      { value: 'product_dev', label: 'Product Development', desc: 'R&D, engineering, feature build-out' },
      { value: 'market_expansion', label: 'Market Expansion', desc: 'Sales, marketing, geographic growth' },
      { value: 'acquisition', label: 'Acquisition', desc: 'Purchasing another business or assets' },
      { value: 'pre_ipo_bridge', label: 'Pre-IPO Bridge', desc: 'Bridging to a public listing' },
      { value: 'other', label: 'Mixed / Other', desc: 'Combination of the above' },
    ],
  },
  {
    key: 'debtComfort' as keyof Profile,
    question: 'Are you comfortable taking on debt with fixed repayment obligations?',
    context: 'Debt preserves equity but requires cash flow to service. Be honest — an unexpected debt payment at the wrong time can be fatal.',
    options: [
      { value: 'yes', label: 'Yes — We Have Predictable Cash Flow', desc: 'Revenue is consistent enough to service debt reliably' },
      { value: 'maybe', label: 'Maybe — Depends on Terms', desc: 'Open to structured repayment if terms are reasonable' },
      { value: 'no', label: 'No — Prefer Equity or Non-Dilutive', desc: 'Cash flow is too unpredictable to commit to fixed payments' },
    ],
  },
  {
    key: 'timeline' as keyof Profile,
    question: 'What is your fundraising timeline?',
    context: 'Most capital raises take longer than founders expect. Budget time accordingly.',
    options: [
      { value: 'immediate', label: 'Immediate (under 3 months)', desc: 'Runway is short — need capital urgently' },
      { value: 'near_term', label: 'Near-Term (3 – 6 months)', desc: 'Actively fundraising now' },
      { value: 'planning', label: 'Planning (6 – 12 months)', desc: 'Building relationships, not yet in market' },
      { value: 'exploratory', label: 'Exploratory (12+ months)', desc: 'Learning about options before committing' },
    ],
  },
  {
    key: 'burnRate' as keyof Profile,
    question: 'What is your approximate monthly cash burn?',
    context: 'Burn rate determines how much runway you have and how urgently you need capital.',
    options: [
      { value: 'under_50k', label: 'Under $50K / month', desc: 'Lean team, low infrastructure costs' },
      { value: '50k_200k', label: '$50K – $200K / month', desc: 'Small team, some operating overhead' },
      { value: '200k_500k', label: '$200K – $500K / month', desc: 'Growing team and infrastructure' },
      { value: '500k_plus', label: '$500K+ / month', desc: 'Scaling operations, significant overhead' },
    ],
  },
]

// Category styles — light theme
const CATEGORY_STYLE: Record<Instrument['category'], { bg: string; color: string; label: string }> = {
  equity:       { bg: '#EFF6FF', color: '#1D4ED8', label: 'Equity' },
  debt:         { bg: '#FFFBEB', color: '#B45309', label: 'Debt' },
  hybrid:       { bg: '#F5F3FF', color: '#7C3AED', label: 'Hybrid' },
  non_dilutive: { bg: '#EAF5F0', color: '#2D7A5F', label: 'Non-Dilutive' },
  public:       { bg: '#FDECEB', color: '#E8312A', label: 'Public Market' },
}

function relevanceScore(instrument: Instrument, profile: Profile): 'high' | 'medium' | 'low' {
  if (!profile.stage && !profile.raiseAmount) return 'medium'
  let score = 0
  if (profile.stage && instrument.relevantStages.includes(profile.stage)) score += 2
  if (profile.raiseAmount && instrument.relevantAmounts.includes(profile.raiseAmount)) score += 2
  if (profile.debtComfort === 'no' && instrument.debtRequired) score -= 3
  if (profile.debtComfort === 'yes' && instrument.debtRequired) score += 1
  if (profile.timeline === 'immediate' && ['convertible_note', 'safe_note', 'revenue_based'].includes(instrument.id)) score += 1
  if (profile.useOfFunds === 'product_dev' && instrument.id === 'government_grants') score += 2
  if (profile.useOfFunds === 'pre_ipo_bridge' && instrument.id === 'ipo_public') score += 2
  return score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low'
}

function InstrumentCard({ instrument, profile }: { instrument: Instrument; profile: Profile }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = instrument.icon
  const relevance = relevanceScore(instrument, profile)
  const profileComplete = Object.values(profile).filter(v => v !== null).length >= 3
  const cat = CATEGORY_STYLE[instrument.category]
  const isHighlighted = profileComplete && relevance === 'high'
  const isDimmed = profileComplete && relevance === 'low'

  return (
    <motion.div layout className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: 'white',
        borderColor: isHighlighted ? '#1A1A1A' : '#E5E4E0',
        opacity: isDimmed ? 0.5 : 1,
      }}>
      <button onClick={() => setExpanded(v => !v)} className="w-full text-left transition-colors"
        style={{ padding: '1.125rem 1.25rem' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: cat.bg }}>
            <Icon className="w-5 h-5" style={{ color: cat.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.2rem' }}>
              <h3 className="text-nav font-semibold text-sm">{instrument.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
              {isHighlighted && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#EAF5F0', color: '#2D7A5F' }}>Matches your profile</span>
              )}
            </div>
            <p className="text-text-muted text-xs">{instrument.tagline}</p>
            <div className="flex items-center gap-4" style={{ marginTop: '0.375rem' }}>
              <span className="text-text-light text-xs flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> {instrument.typicalRange}
              </span>
              <span className="text-text-light text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {instrument.typicalTimeline}
              </span>
            </div>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-text-light flex-shrink-0 mt-1" />
            : <ChevronDown className="w-4 h-4 text-text-light flex-shrink-0 mt-1" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #F0EFED' }}>
              <p className="text-text-muted text-sm leading-relaxed" style={{ padding: '1rem 0 0.875rem' }}>
                {instrument.description}
              </p>

              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.75rem' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.25rem' }}>Cap Table Impact</p>
                  <p className="text-nav text-xs leading-relaxed">{instrument.capTableImpact}</p>
                </div>
                <div className="rounded-xl border" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '0.75rem' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-light" style={{ marginBottom: '0.25rem' }}>Control Impact</p>
                  <p className="text-nav text-xs leading-relaxed">{instrument.controlImpact}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#9A9A9A', marginBottom: '0.5rem' }}>
                    <Info className="w-3 h-3" /> What They Look For
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {instrument.whatInvestorsLookFor.map((item, i) => (
                      <li key={i} className="text-text-muted text-xs leading-relaxed flex gap-2">
                        <span style={{ color: '#D1D5DB', marginTop: '2px', flexShrink: 0 }}>—</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#2D7A5F', marginBottom: '0.5rem' }}>
                    <CheckCircle className="w-3 h-3" /> Benefits
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {instrument.benefits.map((item, i) => (
                      <li key={i} className="text-text-muted text-xs leading-relaxed flex gap-2">
                        <span style={{ color: '#2D7A5F', marginTop: '2px', flexShrink: 0 }}>+</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#B45309', marginBottom: '0.5rem' }}>
                    <AlertTriangle className="w-3 h-3" /> Watch Out For
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {instrument.considerations.map((item, i) => (
                      <li key={i} className="text-text-muted text-xs leading-relaxed flex gap-2">
                        <span style={{ color: '#B45309', marginTop: '2px', flexShrink: 0 }}>!</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RaisingCapitalPage() {
  const { userPlan } = useAppStore()
  const isPaid = userPlan !== 'free'

  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Profile>({
    stage: null, raiseAmount: null, useOfFunds: null,
    debtComfort: null, timeline: null, burnRate: null, hasInstitutional: null,
  })
  const [showInstruments, setShowInstruments] = useState(false)
  const [filterCategory, setFilterCategory] = useState<Instrument['category'] | 'all'>('all')

  const currentQ = QUESTIONS[step]
  const answeredCount = Object.values(profile).filter(v => v !== null).length
  const profileComplete = answeredCount >= QUESTIONS.length

  function answer(value: string) {
    setProfile(prev => ({ ...prev, [currentQ.key]: value }))
    if (step < QUESTIONS.length - 1) setStep(s => s + 1)
    else setShowInstruments(true)
  }

  function reset() {
    setProfile({ stage: null, raiseAmount: null, useOfFunds: null, debtComfort: null, timeline: null, burnRate: null, hasInstitutional: null })
    setStep(0)
    setShowInstruments(false)
    setFilterCategory('all')
  }

  const sortedInstruments = [...INSTRUMENTS].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[relevanceScore(a, profile)] - order[relevanceScore(b, profile)]
  })
  const filteredInstruments = filterCategory === 'all'
    ? sortedInstruments
    : sortedInstruments.filter(i => i.category === filterCategory)

  // Paywall gate
  if (!isPaid) {
    return (
      <div className="max-w-2xl mx-auto text-center" style={{ padding: '4rem 1rem' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: '#F7F6F4', border: '1px solid #E5E4E0', marginBottom: '1.5rem' }}>
          <Lock className="w-8 h-8 text-text-muted" />
        </div>
        <h1 className="serif text-2xl text-nav" style={{ marginBottom: '0.75rem' }}>Capital Education Centre</h1>
        <p className="text-text-muted text-sm leading-relaxed max-w-md mx-auto" style={{ marginBottom: '1.5rem' }}>
          Available on Starter and above. Get a full education on every capital instrument available to you, matched to your company's stage and profile.
        </p>
        <div className="rounded-xl border text-left max-w-sm mx-auto" style={{ background: '#F7F6F4', borderColor: '#E5E4E0', padding: '1.25rem', marginBottom: '1.5rem' }}>
          {['Personalized instrument relevance scoring', 'Detailed investor and lender criteria for each instrument', 'Cap table and control impact analysis', 'Benefits and risks side-by-side'].map(f => (
            <p key={f} className="text-text-muted text-sm flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#2D7A5F' }} /> {f}
            </p>
          ))}
        </div>
        <Link href="/pricing" className="btn btn-primary inline-flex items-center gap-2">
          View Pricing <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-text-light text-xs" style={{ marginTop: '1rem' }}>
          IPOReady does not provide financial advice. This module is educational only.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px' }} suppressHydrationWarning>

      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <Banknote className="w-5 h-5" style={{ color: '#E8312A' }} />
          <h1 className="text-nav font-bold text-2xl">Capital Education Centre</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F7F6F4', color: '#717171', border: '1px solid #E5E4E0' }}>
            Education only
          </span>
        </div>
        <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
          Understand every capital instrument available at your stage. Answer a few questions and we'll show you realistic options — without telling you what to do. Always work with a qualified advisor before raising capital.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border flex items-start gap-3" style={{ background: '#FFFBEB', borderColor: '#FDE68A', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B45309' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
          <strong>This is not financial or legal advice.</strong> IPOReady is a technology platform. The information below is educational only. Before pursuing any form of financing, engage qualified securities counsel, financial advisors, and accountants appropriate to your jurisdiction and situation.
        </p>
      </div>

      {/* Questionnaire */}
      {!showInstruments ? (
        <div className="rounded-2xl border" style={{ background: 'white', borderColor: '#E5E4E0', padding: '1.75rem', maxWidth: '600px' }}>

          {/* Progress */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
              <span className="text-text-muted text-xs">Question {step + 1} of {QUESTIONS.length}</span>
              <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{Math.round((step / QUESTIONS.length) * 100)}% complete</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: '4px', background: '#F0EFED' }}>
              <div className="rounded-full transition-all duration-500" style={{ height: '4px', background: '#1A1A1A', width: `${(step / QUESTIONS.length) * 100}%` }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>

              <h2 className="text-nav font-bold text-lg leading-snug" style={{ marginBottom: '0.375rem' }}>{currentQ.question}</h2>
              <p className="text-text-muted text-sm leading-relaxed" style={{ marginBottom: '1.25rem' }}>{currentQ.context}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentQ.options.map(opt => (
                  <button key={opt.value} onClick={() => answer(opt.value)}
                    className="w-full text-left rounded-xl border transition-all group"
                    style={{ padding: '0.875rem 1rem', background: 'white', borderColor: '#E5E4E0' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.background = '#FAFAF9' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E4E0'; e.currentTarget.style.background = 'white' }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-nav text-sm font-medium">{opt.label}</p>
                        <p className="text-text-muted text-xs" style={{ marginTop: '0.125rem' }}>{opt.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-light flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between" style={{ marginTop: '1.25rem' }}>
                {step > 0
                  ? <button onClick={() => setStep(s => s - 1)} className="text-text-muted hover:text-nav text-sm transition-colors">← Back</button>
                  : <span />}
                <button onClick={() => setShowInstruments(true)} className="text-text-light hover:text-text-muted text-xs transition-colors">
                  Skip — show all instruments →
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

          {/* Profile summary */}
          <div className="rounded-xl border flex items-center justify-between gap-4 flex-wrap" style={{ background: 'white', borderColor: '#E5E4E0', padding: '0.875rem 1.25rem', marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EAF5F0' }}>
                <CheckCircle className="w-4 h-4" style={{ color: '#2D7A5F' }} />
              </div>
              <div>
                <p className="text-nav text-sm font-semibold">
                  {profileComplete ? 'Profile complete — instruments sorted by relevance' : `${answeredCount} of ${QUESTIONS.length} questions answered`}
                </p>
                {!profileComplete && <p className="text-text-light text-xs">Partial profile — relevance scoring is approximate</p>}
              </div>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-nav transition-colors rounded-lg border"
              style={{ padding: '0.375rem 0.75rem', borderColor: '#E5E4E0', background: '#F7F6F4' }}>
              <RotateCcw className="w-3 h-3" /> Retake
            </button>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap" style={{ marginBottom: '1.25rem' }}>
            {(['all', 'equity', 'hybrid', 'debt', 'non_dilutive', 'public'] as const).map(cat => {
              const style = cat !== 'all' ? CATEGORY_STYLE[cat] : null
              const isActive = filterCategory === cat
              return (
                <button key={cat} onClick={() => setFilterCategory(cat)}
                  className="text-xs rounded-full border transition-all font-medium"
                  style={{
                    padding: '0.375rem 0.875rem',
                    ...(isActive && style
                      ? { background: style.bg, color: style.color, borderColor: style.color + '66' }
                      : isActive
                      ? { background: '#1A1A1A', color: 'white', borderColor: '#1A1A1A' }
                      : { background: 'white', color: '#717171', borderColor: '#E5E4E0' })
                  }}>
                  {cat === 'all' ? 'All Instruments' : CATEGORY_STYLE[cat].label}
                </button>
              )
            })}
          </div>

          {/* Instrument cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {filteredInstruments.map(instrument => (
              <InstrumentCard key={instrument.id} instrument={instrument} profile={profile} />
            ))}
          </div>

          {/* Footer disclaimer */}
          <div className="rounded-xl border" style={{ background: '#FFFBEB', borderColor: '#FDE68A', padding: '1rem 1.25rem' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#B45309', marginBottom: '0.375rem' }}>Important Disclosure</p>
            <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
              The information on this page is provided for educational purposes only and does not constitute financial, legal, tax, or investment advice. IPOReady is a technology workflow platform. Nothing here constitutes a recommendation, solicitation, or offer to buy or sell any security. All capital raise decisions should be made in consultation with qualified legal counsel, securities advisors, auditors, and financial professionals appropriate to your jurisdiction. Typical ranges, timelines, and criteria shown are generalisations — actual terms and availability vary significantly by company, market conditions, and jurisdiction.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
