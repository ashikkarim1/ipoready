'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Briefcase, Lock, AlertTriangle, Users, FileText, DownloadCloud,
  ChevronDown, CheckCircle2, Calendar, TrendingUp, Info, Download, Share2,
  ShieldAlert, Zap, BarChart3, Search, Filter, ArrowRight, Heart, Lightbulb,
  Clock, DollarSign, Target
} from 'lucide-react'

// Types
interface InsuranceType {
  id: string
  name: string
  shortName: string
  icon: React.ReactNode
  color: string
  bgColor: string
  what: string
  why: string
  costRange: string
  coverageMin: string
  preIPO: string
  postIPO: string
  exchanges: string[]
  exclusions: string[]
  details: string
}

interface QuizResponse {
  exchange: string
  industry: string
  marketCap: number
  sensitiveData: boolean
  significantIP: boolean
}

interface Provider {
  id: string
  name: string
  specialization: string
  types: string[]
  costRange: string
  testimonial: string
  logo?: string
  referralFee: string
}

interface Recommendation {
  insuranceType: string
  level: 'REQUIRED' | 'HIGHLY_RECOMMENDED' | 'RECOMMENDED'
}

// Insurance Types Data
const INSURANCE_TYPES: InsuranceType[] = [
  {
    id: 'dno',
    name: 'Directors & Officers (D&O)',
    shortName: 'D&O',
    icon: <ShieldAlert className="w-6 h-6" />,
    color: '#E8312A',
    bgColor: '#FDECEB',
    what: 'Covers board members\' personal liability from shareholder lawsuits, regulatory actions, and breach of fiduciary duty claims.',
    why: 'Legally REQUIRED post-IPO. Protects directors/officers from personal financial ruin. Exchanges mandate minimum coverage.',
    costRange: '$50K - $200K/year',
    coverageMin: '$5M - $50M (depends on market cap & exchange)',
    preIPO: 'Optional, but board should consider',
    postIPO: 'MANDATORY',
    exchanges: ['TSX', 'TSXV', 'NASDAQ', 'NYSE', 'CSE'],
    exclusions: ['Fraud', 'Insider trading', 'Criminal acts', 'Intentional wrongdoing'],
    details: 'D&O insurance is your first line of defense against the financial exposure of public company leadership. After an IPO, directors and officers become targets for litigation from shareholders, regulatory bodies, and other stakeholders. This insurance covers defense costs, settlements, and judgments related to alleged wrongful acts in their official capacities.'
  },
  {
    id: 'eno',
    name: 'Errors & Omissions (E&O)',
    shortName: 'E&O',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    what: 'Covers professional liability for negligent acts or omissions by directors, officers, and managers.',
    why: 'Protects stakeholders from losses due to professional mistakes. Increasingly expected by investors and underwriters.',
    costRange: '$30K - $100K/year',
    coverageMin: '$2M - $10M',
    preIPO: 'Recommended',
    postIPO: 'Highly recommended (often not mandated, but expected)',
    exchanges: ['TSX', 'TSXV', 'NASDAQ', 'NYSE'],
    exclusions: ['Intentional dishonesty', 'Criminal acts', 'Fraud'],
    details: 'E&O insurance bridges the gap between D&O coverage by insuring the company itself against claims of professional negligence. This is crucial for companies with significant advisory, management, or consulting functions.'
  },
  {
    id: 'cyber',
    name: 'Cyber Liability Insurance',
    shortName: 'Cyber',
    icon: <Lock className="w-6 h-6" />,
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    what: 'Covers data breaches, ransomware attacks, business interruption, and regulatory fines from cyber incidents.',
    why: 'SEDAR+/SEC systems contain sensitive financial data. Post-IPO, company becomes high-value target for hackers.',
    costRange: '$20K - $50K/year',
    coverageMin: '$1M - $5M',
    preIPO: 'Optional',
    postIPO: 'Increasingly expected by institutional investors',
    exchanges: ['NASDAQ', 'NYSE', 'TSX'],
    exclusions: ['Pre-existing vulnerabilities', 'War', 'Acts of state'],
    details: 'Cyber insurance is no longer optional for public companies. As a public company, you\'ll manage confidential investor data, financial information, and trade secrets. A single breach could cost millions in regulatory fines, notification costs, and reputation damage.'
  },
  {
    id: 'crime',
    name: 'Crime Insurance (Fidelity Bond)',
    shortName: 'Crime',
    icon: <Briefcase className="w-6 h-6" />,
    color: '#EA580C',
    bgColor: '#FFEDD5',
    what: 'Covers employee theft, fraud, forgery, and financial statement misstatement.',
    why: 'Post-IPO audit requirements increase exposure. Protects against internal fraud and financial crimes.',
    costRange: '$15K - $40K/year',
    coverageMin: '$1M - $3M',
    preIPO: 'Optional',
    postIPO: 'Recommended',
    exchanges: ['TSX', 'NASDAQ', 'NYSE'],
    exclusions: ['Losses involving collusion', 'Prior known dishonesty'],
    details: 'Crime insurance protects your company against internal threats. As a public company subject to SOX compliance and quarterly audits, fraud becomes exponentially more costly to uncover and remediate.'
  },
  {
    id: 'epli',
    name: 'Employment Practices Liability (EPLI)',
    shortName: 'EPLI',
    icon: <Users className="w-6 h-6" />,
    color: '#10B981',
    bgColor: '#ECFDF5',
    what: 'Covers discrimination, harassment, retaliation, wrongful termination, and wage/hour claims.',
    why: 'Higher public profile post-IPO increases lawsuit risk. Protects company and executives from employment-related claims.',
    costRange: '$20K - $60K/year',
    coverageMin: '$1M - $3M',
    preIPO: 'Optional',
    postIPO: 'Expected (part of comprehensive package)',
    exchanges: ['NASDAQ', 'NYSE', 'TSX'],
    exclusions: ['Pre-existing complaints', 'Willful violations'],
    details: 'EPLI becomes critical for public companies because employees are more likely to pursue litigation when their employer is publicly traded and has visible assets. This coverage protects against the devastating cost of employment-related lawsuits.'
  },
  {
    id: 'media',
    name: 'Media Liability Insurance',
    shortName: 'Media',
    icon: <Heart className="w-6 h-6" />,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    what: 'Covers defamation, invasion of privacy, copyright/trademark infringement in company communications.',
    why: 'CEO/company public statements post-IPO increase exposure. Protects against media-related claims.',
    costRange: '$10K - $30K/year',
    coverageMin: '$1M - $2M',
    preIPO: 'Optional',
    postIPO: 'Recommended for companies with strong PR/communications',
    exchanges: ['NASDAQ', 'NYSE'],
    exclusions: ['Statements known to be false', 'Prior complaints'],
    details: 'Media liability becomes important for public companies that make frequent public statements, issue press releases, or have active investor relations programs. A single defamatory statement could result in significant liability.'
  }
]

// Provider Data
const PROVIDERS: Record<string, Provider[]> = {
  'dno': [
    {
      id: 'aon-dno',
      name: 'Aon',
      specialization: 'Tech & Growth Companies',
      types: ['D&O'],
      costRange: '$80K - $180K/year',
      testimonial: 'Aon\'s D&O insurance helped us close our IPO on schedule with comprehensive board protection.',
      referralFee: 'IPOReady earns 8% referral fee on qualifying policies',
    },
    {
      id: 'marsh-dno',
      name: 'Marsh & McLennan',
      specialization: 'Cross-border IPOs',
      types: ['D&O', 'Cyber'],
      costRange: '$65K - $150K/year',
      testimonial: 'Their experience with Canadian IPOs made the underwriting process seamless.',
      referralFee: 'IPOReady earns 8% referral fee on qualifying policies',
    },
    {
      id: 'towers-watson-dno',
      name: 'Towers Watson',
      specialization: 'Biotech & Healthcare',
      types: ['D&O'],
      costRange: '$95K - $200K/year',
      testimonial: 'Best-in-class expertise for highly regulated industries.',
      referralFee: 'IPOReady earns 8% referral fee on qualifying policies',
    },
  ],
  'eno': [
    {
      id: 'chubb-eno',
      name: 'Chubb',
      specialization: 'Comprehensive Coverage',
      types: ['E&O', 'D&O'],
      costRange: '$40K - $95K/year',
      testimonial: 'Chubb\'s E&O coverage gave us peace of mind during our IPO roadshow.',
      referralFee: 'IPOReady earns 7% referral fee on qualifying policies',
    },
    {
      id: 'ace-eno',
      name: 'ACE Limited',
      specialization: 'Executive Coverage',
      types: ['E&O'],
      costRange: '$35K - $90K/year',
      testimonial: 'Fast underwriting and competitive rates.',
      referralFee: 'IPOReady earns 7% referral fee on qualifying policies',
    },
  ],
  'cyber': [
    {
      id: 'cyber-insurance-co',
      name: 'Cyber Insurance Co.',
      specialization: 'Tech Companies',
      types: ['Cyber'],
      costRange: '$25K - $50K/year',
      testimonial: 'Rapid response team helped us navigate a breach incident smoothly.',
      referralFee: 'IPOReady earns 6% referral fee on qualifying policies',
    },
    {
      id: 'lock-shield',
      name: 'LockShield',
      specialization: 'FinTech & SaaS',
      types: ['Cyber'],
      costRange: '$20K - $45K/year',
      testimonial: 'Excellent breach response and recovery services.',
      referralFee: 'IPOReady earns 6% referral fee on qualifying policies',
    },
  ],
  'crime': [
    {
      id: 'allied-crime',
      name: 'Allied World',
      specialization: 'Financial Crime',
      types: ['Crime'],
      costRange: '$18K - $40K/year',
      testimonial: 'Proactive fraud prevention consulting included.',
      referralFee: 'IPOReady earns 5% referral fee on qualifying policies',
    },
  ],
  'epli': [
    {
      id: 'hr-liability',
      name: 'HR Liability Insurance Corp',
      specialization: 'Employment Claims',
      types: ['EPLI'],
      costRange: '$25K - $60K/year',
      testimonial: 'Expert legal defense team available 24/7.',
      referralFee: 'IPOReady earns 6% referral fee on qualifying policies',
    },
  ],
  'media': [
    {
      id: 'media-guard',
      name: 'MediaGuard',
      specialization: 'Public Companies',
      types: ['Media'],
      costRange: '$12K - $28K/year',
      testimonial: 'Essential coverage for our active IR team.',
      referralFee: 'IPOReady earns 5% referral fee on qualifying policies',
    },
  ],
}

// Exchange requirements mapping
const EXCHANGE_REQUIREMENTS: Record<string, Record<string, Recommendation>> = {
  'TSX': {
    'dno': { insuranceType: 'D&O', level: 'REQUIRED' },
    'eno': { insuranceType: 'E&O', level: 'HIGHLY_RECOMMENDED' },
    'cyber': { insuranceType: 'Cyber', level: 'RECOMMENDED' },
    'crime': { insuranceType: 'Crime', level: 'RECOMMENDED' },
    'epli': { insuranceType: 'EPLI', level: 'RECOMMENDED' },
  },
  'TSXV': {
    'dno': { insuranceType: 'D&O', level: 'REQUIRED' },
    'cyber': { insuranceType: 'Cyber', level: 'RECOMMENDED' },
  },
  'NASDAQ': {
    'dno': { insuranceType: 'D&O', level: 'REQUIRED' },
    'eno': { insuranceType: 'E&O', level: 'HIGHLY_RECOMMENDED' },
    'cyber': { insuranceType: 'Cyber', level: 'HIGHLY_RECOMMENDED' },
    'epli': { insuranceType: 'EPLI', level: 'HIGHLY_RECOMMENDED' },
    'crime': { insuranceType: 'Crime', level: 'RECOMMENDED' },
    'media': { insuranceType: 'Media', level: 'RECOMMENDED' },
  },
  'NYSE': {
    'dno': { insuranceType: 'D&O', level: 'REQUIRED' },
    'eno': { insuranceType: 'E&O', level: 'HIGHLY_RECOMMENDED' },
    'cyber': { insuranceType: 'Cyber', level: 'HIGHLY_RECOMMENDED' },
    'epli': { insuranceType: 'EPLI', level: 'HIGHLY_RECOMMENDED' },
    'crime': { insuranceType: 'Crime', level: 'RECOMMENDED' },
    'media': { insuranceType: 'Media', level: 'RECOMMENDED' },
  },
  'CSE': {
    'dno': { insuranceType: 'D&O', level: 'REQUIRED' },
    'cyber': { insuranceType: 'Cyber', level: 'RECOMMENDED' },
  },
}

// Components
function InsightCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border border-slate-200 p-8 flex gap-5 hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0">
        <div className="p-3 rounded-lg bg-red-50">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

function InsuranceTypeCard({ insurance, isExpanded, onToggle }: { insurance: InsuranceType; isExpanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      className={`rounded-lg border cursor-pointer transition-all ${
        isExpanded
          ? 'border-slate-400 shadow-lg'
          : 'border-slate-200 hover:shadow-md hover:border-slate-300'
      }`}
      style={{
        backgroundColor: insurance.bgColor,
        borderColor: isExpanded ? insurance.color : undefined,
      }}
      onClick={onToggle}
    >
      <div className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 rounded-lg bg-white" style={{ color: insurance.color }}>
                {insurance.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{insurance.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{insurance.costRange}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{insurance.what}</p>
          </div>
          <ChevronDown
            className="flex-shrink-0 transition-transform"
            style={{
              color: insurance.color,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 pt-8 border-t border-slate-300 space-y-8"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Why Required</label>
                  <p className="text-sm text-slate-700">{insurance.why}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Coverage Minimum</label>
                  <p className="text-sm text-slate-700">{insurance.coverageMin}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Pre-IPO</label>
                  <p className="text-sm text-slate-700">{insurance.preIPO}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Post-IPO</label>
                  <p className="text-sm font-semibold" style={{ color: insurance.color }}>{insurance.postIPO}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Key Exclusions</label>
                <div className="flex flex-wrap gap-2">
                  {insurance.exclusions.map((exc, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-slate-700 border border-slate-300">
                      {exc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Applicable Exchanges</label>
                <div className="flex flex-wrap gap-2">
                  {insurance.exchanges.map((exc, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-slate-700 border border-slate-300">
                      {exc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded p-6 border border-slate-300">
                <p className="text-sm text-slate-700 leading-relaxed">{insurance.details}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function RecommendationBadge({ level }: { level: 'REQUIRED' | 'HIGHLY_RECOMMENDED' | 'RECOMMENDED' }) {
  const config = {
    'REQUIRED': { bg: '#FEE2E2', color: '#991B1B', label: 'REQUIRED' },
    'HIGHLY_RECOMMENDED': { bg: '#FEF08A', color: '#713F12', label: 'HIGHLY RECOMMENDED' },
    'RECOMMENDED': { bg: '#D1FAE5', color: '#065F46', label: 'RECOMMENDED' },
  }[level]

  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}

function ProviderCard({ provider }: { provider: Provider }) {
  const trackInsuranceQuote = async () => {
    try {
      await fetch('/api/referrals/insurance-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_name: provider.name,
          insurance_types: provider.types,
          status: 'quote_requested',
        }),
      })
    } catch (error) {
      console.error('Error tracking referral:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h4 className="font-bold text-slate-900">{provider.name}</h4>
          <p className="text-xs text-slate-600 mt-1">{provider.specialization}</p>
        </div>
        <Shield className="w-6 h-6 text-slate-400 flex-shrink-0" />
      </div>

      <p className="text-xs text-slate-600 italic mb-6 leading-relaxed">"{provider.testimonial}"</p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-slate-600">Coverage Types</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {provider.types.map((type, idx) => (
              <span key={idx} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">
                {type}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Cost Range</label>
          <p className="text-sm font-semibold text-slate-900 mt-1">{provider.costRange}</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded border border-blue-200 mb-6">
        <p className="text-xs text-blue-900 leading-relaxed">{provider.referralFee}</p>
      </div>

      <button
        onClick={trackInsuranceQuote}
        className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        Get Quote
      </button>
    </motion.div>
  )
}

function TimelineItem({ phase, timing, title, description, items }: { phase: number; timing: string; title: string; description: string; items: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex gap-6 pb-12 relative"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {phase}
        </div>
        <div className="w-1 flex-1 bg-gradient-to-b from-red-300 to-transparent mt-2" />
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">{timing}</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-5 leading-relaxed">{description}</p>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function InsurancesPage() {
  const [expandedInsurance, setExpandedInsurance] = useState<string | null>('dno')
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResponse, setQuizResponse] = useState<QuizResponse>({
    exchange: 'TSX',
    industry: 'Technology',
    marketCap: 100,
    sensitiveData: true,
    significantIP: true,
  })
  const [showProviders, setShowProviders] = useState(false)
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>('dno')

  const recommendations = useMemo(() => {
    const exchangeReqs = EXCHANGE_REQUIREMENTS[quizResponse.exchange] || {}
    const recs: Recommendation[] = Object.values(exchangeReqs)

    // Add additional recommendations based on industry/data profile
    if (quizResponse.sensitiveData && !recs.find(r => r.insuranceType === 'Cyber')) {
      recs.push({ insuranceType: 'Cyber', level: 'HIGHLY_RECOMMENDED' })
    }
    if (quizResponse.significantIP && !recs.find(r => r.insuranceType === 'Media')) {
      recs.push({ insuranceType: 'Media', level: 'RECOMMENDED' })
    }

    return recs
  }, [quizResponse])

  const getInsuranceById = (id: string) => INSURANCE_TYPES.find(i => i.id === id)

  const estimatedAnnualCost = useMemo(() => {
    let total = 0
    recommendations.forEach(rec => {
      const insurance = INSURANCE_TYPES.find(i => i.name === rec.insuranceType)
      if (insurance) {
        const match = insurance.costRange.match(/\$(\d+)K/)
        if (match) {
          const baseValue = parseInt(match[1]) * 1000
          const multiplier = quizResponse.marketCap / 100
          total += baseValue * Math.max(0.8, Math.min(2, multiplier))
        }
      }
    })
    return Math.round(total)
  }, [recommendations, quizResponse.marketCap])

  return (
    <div className="min-h-screen suppressHydrationWarning" style={{ background: '#F7F6F4' }}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden border-b"
        style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="serif text-5xl lg:text-6xl font-bold text-nav leading-tight">
                Protect Your Board, Officers & Company
              </h1>
              <h2 className="text-2xl text-text-muted mt-6 font-semibold">
                The Complete Insurance Guide for IPO-Ready Companies
              </h2>
              <p className="text-base text-text-muted mt-6 max-w-3xl leading-relaxed">
                Understanding insurance requirements before and after your IPO is critical to protecting your leadership, your company, and your investors. This guide walks you through every insurance type, calculates your needs, and connects you with top providers.
              </p>
            </motion.div>

            {/* Insight Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12"
            >
              <InsightCard
                icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
                title="D&O is Legally Required"
                description="Directors & Officers insurance is mandatory post-IPO. Your exchange will require it as a listing condition."
              />
              <InsightCard
                icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
                title="Costs Jump 3-5x"
                description="Insurance premiums increase significantly after listing. Budget CAD $150K-500K+ annually for comprehensive coverage."
              />
              <InsightCard
                icon={<Target className="w-5 h-5 text-amber-600" />}
                title="Exchange-Specific Rules"
                description="TSX, NASDAQ, and NYSE all specify minimum coverage amounts and types. Your target exchange determines your needs."
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Insurance Types Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-24 px-4 md:px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="h2 text-nav mb-4 flex items-center gap-3">
              <Shield className="w-8 h-8" style={{ color: '#E8312A' }} />
              Insurance Types Guide
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              Comprehensive breakdown of each insurance type, why it matters, and when you need it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            {INSURANCE_TYPES.map((insurance) => (
              <InsuranceTypeCard
                key={insurance.id}
                insurance={insurance}
                isExpanded={expandedInsurance === insurance.id}
                onToggle={() => setExpandedInsurance(expandedInsurance === insurance.id ? null : insurance.id)}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quiz Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-24 px-4 md:px-6 lg:px-12"
        style={{ borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0', background: '#FFFFFF' }}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="h2 text-nav mb-4 flex items-center gap-3">
              <Lightbulb className="w-8 h-8" style={{ color: '#B45309' }} />
              What Insurance Do YOU Need?
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              Answer a few quick questions to see personalized recommendations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                What's your target exchange?
              </label>
              <select
                value={quizResponse.exchange}
                onChange={(e) => setQuizResponse({ ...quizResponse, exchange: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {Object.keys(EXCHANGE_REQUIREMENTS).map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                What's your industry?
              </label>
              <select
                value={quizResponse.industry}
                onChange={(e) => setQuizResponse({ ...quizResponse, industry: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {['Technology', 'Biotech', 'Finance', 'Energy', 'Real Estate', 'Healthcare', 'Retail', 'Manufacturing'].map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Estimated post-IPO market cap: <span className="text-red-500 font-bold">${quizResponse.marketCap}M</span>
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={quizResponse.marketCap}
                onChange={(e) => setQuizResponse({ ...quizResponse, marketCap: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>$50M</span>
                <span>$500M+</span>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quizResponse.sensitiveData}
                  onChange={(e) => setQuizResponse({ ...quizResponse, sensitiveData: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Does your company handle sensitive data?</span>
              </label>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quizResponse.significantIP}
                  onChange={(e) => setQuizResponse({ ...quizResponse, significantIP: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Do you have significant IP?</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProviders(true)}
              className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              See My Recommendations
            </motion.button>
          </motion.div>

          {/* Recommendations Display */}
          <AnimatePresence>
            {showProviders && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-12 pt-12 border-t border-slate-200 space-y-10"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Your Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((rec) => {
                      const insurance = INSURANCE_TYPES.find(i => i.name === rec.insuranceType)
                      return (
                        <motion.div
                          key={rec.insuranceType}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-50 rounded-lg p-8 border border-slate-200"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <h4 className="font-bold text-slate-900">{rec.insuranceType}</h4>
                              <p className="text-sm text-slate-600">{insurance?.costRange}</p>
                            </div>
                            <RecommendationBadge level={rec.level} />
                          </div>
                          <p className="text-sm text-slate-700 mb-4">{insurance?.what}</p>
                          <button
                            onClick={() => {
                              setSelectedInsuranceType(insurance?.id || '')
                              setExpandedInsurance(insurance?.id || null)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-2"
                          >
                            Learn More <ArrowRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Estimated Cost */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-8"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Estimated Annual Insurance Cost</h4>
                      <p className="text-sm text-slate-700 mb-4">
                        Based on your profile ({quizResponse.exchange} • ${quizResponse.marketCap}M market cap)
                      </p>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-emerald-700">
                          CAD ${(estimatedAnnualCost * 1.35).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          or USD ${estimatedAnnualCost.toLocaleString()} annually
                        </p>
                      </div>
                    </div>
                    <BarChart3 className="w-12 h-12 text-emerald-200 flex-shrink-0" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Provider Recommendations */}
      {showProviders && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="py-12 md:py-16 lg:py-24 px-4 md:px-6 lg:px-12"
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="h2 text-nav mb-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8" style={{ color: '#1D4ED8' }} />
                Top Provider Recommendations
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                Based on your profile, here are the best-fit providers for each insurance type you need.
              </p>
            </motion.div>

            {recommendations.map((rec) => {
              const insuranceKey = rec.insuranceType.toLowerCase().replace(/[&\s]/g, '').replace(/\(.*?\)/, '')
              const providers = PROVIDERS[insuranceKey] || []

              return (
                <motion.div
                  key={rec.insuranceType}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900">{rec.insuranceType}</h3>
                    <RecommendationBadge level={rec.level} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {providers.slice(0, 3).map((provider) => (
                      <ProviderCard key={provider.id} provider={provider} />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Timeline Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-24 px-4 md:px-6 lg:px-12"
        style={{ borderTop: '1px solid #E5E4E0', borderBottom: '1px solid #E5E4E0', background: '#FFFFFF' }}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="h2 text-nav mb-4 flex items-center gap-3">
              <Calendar className="w-8 h-8" style={{ color: '#B45309' }} />
              Insurance Timeline & Roadmap
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              When to get each type of insurance and what to do at each stage of your IPO journey.
            </p>
          </motion.div>

          <div className="relative">
            <TimelineItem
              phase={1}
              timing="12 Months Pre-IPO"
              title="Assessment & Planning"
              description="Start thinking about insurance strategy early. Review your current D&O and begin scoping needs."
              items={[
                'Conduct insurance gap analysis',
                'Identify board members and officers for D&O coverage',
                'Begin preliminary underwriting discussions',
                'Budget for insurance costs ($150K-500K CAD annually)',
              ]}
            />

            <TimelineItem
              phase={2}
              timing="6 Months Pre-IPO"
              title="Finalize D&O & Explore Coverage"
              description="Lock in your D&O provider and begin underwriting. Explore additional coverage types."
              items={[
                'Select D&O insurance provider',
                'Complete underwriting questionnaires',
                'Finalize D&O coverage limits and terms',
                'Begin E&O, Cyber, and EPLI underwriting',
              ]}
            />

            <TimelineItem
              phase={3}
              timing="3 Months Pre-IPO"
              title="Lock in Pricing & Coordinate"
              description="Finalize all policies and coordinate with legal, underwriters, and your investment bank."
              items={[
                'Receive and approve insurance quotes',
                'Negotiate terms with providers',
                'Coordinate with underwriters on requirements',
                'Ensure all policies are ready to bind at IPO close',
              ]}
            />

            <TimelineItem
              phase={4}
              timing="At IPO Closing"
              title="Activate Coverage"
              description="Activate all post-IPO insurance coverages as part of your listing conditions."
              items={[
                'Bind all insurance policies',
                'Provide proof of insurance to exchange',
                'File documentation with regulatory authorities',
                'Notify all policies of IPO closing',
              ]}
            />

            <TimelineItem
              phase={5}
              timing="Post-IPO (Ongoing)"
              title="Annual Reviews & Renewals"
              description="Review insurance needs annually as your company grows and evolves."
              items={[
                'Conduct annual insurance policy reviews',
                'Renew policies before expiration',
                'Adjust coverage limits based on market cap growth',
                'Monitor for regulatory changes',
              ]}
            />
          </div>
        </div>
      </motion.section>

      {/* Exchange Requirements Table */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-500" />
              Regulatory Requirements by Exchange
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Each exchange has specific insurance requirements. Use this guide to understand your obligations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto mb-12"
          >
            <table className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-left text-sm font-bold text-slate-900">Insurance Type</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">TSX</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">TSXV</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">NASDAQ</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">NYSE</th>
                  <th className="px-6 py-5 text-center text-sm font-bold text-slate-900">CSE</th>
                </tr>
              </thead>
              <tbody>
                {INSURANCE_TYPES.map((insurance) => (
                  <tr key={insurance.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-900">{insurance.shortName}</td>
                    {['TSX', 'TSXV', 'NASDAQ', 'NYSE', 'CSE'].map((exchange) => {
                      const req = (EXCHANGE_REQUIREMENTS[exchange] || {})[insurance.id]
                      const levelColor = {
                        'REQUIRED': '#FEE2E2',
                        'HIGHLY_RECOMMENDED': '#FEF08A',
                        'RECOMMENDED': '#D1FAE5',
                      }[req?.level || '']

                      return (
                        <td
                          key={exchange}
                          className="px-6 py-5 text-center text-xs font-semibold"
                          style={{ backgroundColor: levelColor || '#F3F4F6' }}
                        >
                          {req ? req.level.replace(/_/g, ' ') : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-12 bg-white border-y border-slate-200"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-cyan-500" />
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "When do I NEED to have D&O insurance?",
                a: "D&O insurance is mandatory before your IPO closes. Underwriters and exchanges require it as a listing condition. You should begin underwriting 6-12 months before your projected IPO date."
              },
              {
                q: "How much does insurance cost after going public?",
                a: "Costs vary significantly by company size, industry, and risk profile. Expect CAD $150K-500K annually for comprehensive coverage (D&O, E&O, Cyber, EPLI, Crime). Costs typically increase 3-5x from pre-IPO levels."
              },
              {
                q: "Can I change insurance providers after listing?",
                a: "Yes, you can change providers at renewal, but switching typically requires re-underwriting. Many companies stay with their IPO provider for continuity and established relationships."
              },
              {
                q: "What if my board is only 3 people?",
                a: "Even small boards need D&O insurance. Smaller boards may qualify for lower premiums, but coverage is still required. Underwriters will focus on risk profile rather than just board size."
              },
              {
                q: "Do I need insurance if my company is acquired?",
                a: "If you're acquired post-IPO, you may need tail coverage to protect directors/officers after exit. This is typically negotiated as part of the acquisition agreement."
              },
              {
                q: "Which exchange requires the most insurance?",
                a: "NYSE and NASDAQ have the most comprehensive insurance requirements, including D&O, E&O, Cyber, and EPLI. TSX/TSXV primarily mandate D&O with other types recommended."
              },
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <summary className="px-8 py-6 flex items-center justify-between gap-4 font-semibold text-slate-900 select-none">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-8 pb-6 text-slate-700 leading-relaxed border-t border-slate-200 pt-6">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Resources Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <DownloadCloud className="w-8 h-8 text-indigo-500" />
              Resources & Guides
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Download helpful guides and reference materials for your insurance planning.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                title: 'Complete Insurance Guide for IPO-Ready Companies',
                description: 'Comprehensive 50-page guide covering all insurance types, cost benchmarks, and timelines.',
                icon: <FileText className="w-8 h-8" />,
              },
              {
                title: 'Director & Officer Insurance FAQs',
                description: 'In-depth Q&A covering D&O coverage, exclusions, claims process, and common scenarios.',
                icon: <Lightbulb className="w-8 h-8" />,
              },
              {
                title: 'Cost Benchmarks by Exchange & Industry',
                description: 'Reference data: typical insurance costs for companies on TSX, NASDAQ, NYSE, and more.',
                icon: <BarChart3 className="w-8 h-8" />,
              },
              {
                title: 'Insurance Provider Directory',
                description: '100+ vetted insurance providers with specializations, contact info, and client reviews.',
                icon: <Users className="w-8 h-8" />,
              },
            ].map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-slate-600">{resource.icon}</div>
                  <h3 className="font-bold text-slate-900">{resource.title}</h3>
                </div>
                <p className="text-sm text-slate-700 mb-6 leading-relaxed">{resource.description}</p>
                <button className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-16 md:py-20 lg:py-24 px-4 md:px-6 lg:px-12 bg-gradient-to-r from-red-50 to-orange-50 border-t border-slate-200"
      >
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Get Insured?
            </h2>
            <p className="text-slate-700 max-w-2xl mx-auto leading-relaxed">
              Use our quiz above to identify your insurance needs, then connect with top-rated providers who specialize in IPO-ready companies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-6 justify-center flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Take the Quiz
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Guide
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
