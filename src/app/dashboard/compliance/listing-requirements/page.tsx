'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, CheckCircle2, AlertCircle, Clock, FileText,
  TrendingUp, Filter, Download, Share2, Info, ChevronRight,
  Lock, Users, BarChart3, Target, Calendar, Zap, Settings
} from 'lucide-react'

// Type definitions
interface Requirement {
  id: string
  category: string
  name: string
  description: string
  status: 'compliant' | 'warning' | 'critical' | 'pending'
  requirement: string
  companyValue?: string | number
  deadline?: string
  documents?: string[]
  notes?: string
}

interface ExchangeRequirements {
  exchangeId: string
  exchangeName: string
  country: string
  currency: string
  requirements: Requirement[]
  completionPercentage: number
  criticalCount: number
  warningCount: number
  deadlineSoon: number // Days until next deadline
}

const EXCHANGES = [
  { id: 'TSX', name: 'Toronto Stock Exchange', country: 'Canada', currency: 'CAD' },
  { id: 'NASDAQ', name: 'NASDAQ', country: 'United States', currency: 'USD' },
  { id: 'NYSE', name: 'New York Stock Exchange', country: 'United States', currency: 'USD' },
]

// Sample requirements data for each exchange
const EXCHANGE_DATA: Record<string, ExchangeRequirements> = {
  TSX: {
    exchangeId: 'TSX',
    exchangeName: 'Toronto Stock Exchange',
    country: 'Canada',
    currency: 'CAD',
    completionPercentage: 72,
    criticalCount: 2,
    warningCount: 4,
    deadlineSoon: 14,
    requirements: [
      {
        id: 'tsx-float-1',
        category: 'Public Float',
        name: 'Minimum Public Float Percentage',
        description: 'At least 25% of shares must be held by public investors',
        status: 'compliant',
        requirement: '25% of issued shares',
        companyValue: '28.5%',
        documents: ['Cap Table v3.0', 'Shareholder Registry'],
      },
      {
        id: 'tsx-float-2',
        category: 'Public Float',
        name: 'Minimum Float Value (CAD)',
        description: 'Public float must be worth minimum CAD 20 million',
        status: 'compliant',
        requirement: 'CAD $20,000,000',
        companyValue: 'CAD $85,600,000',
        documents: ['Valuation Report', 'Underwriter Analysis'],
      },
      {
        id: 'tsx-shares-1',
        category: 'Share Structure',
        name: 'Minimum Public Shares',
        description: 'At least 4 million shares must be in public hands',
        status: 'critical',
        requirement: '4,000,000 shares',
        companyValue: '2,100,000 shares',
        deadline: '2026-06-30',
        notes: 'Shortfall: 1.9M shares. Consider secondary offering.',
        documents: ['IPO Prospectus', 'Underwriting Agreement'],
      },
      {
        id: 'tsx-shares-2',
        category: 'Share Structure',
        name: 'Minimum Number of Shareholders',
        description: 'At least 300 public shareholders required',
        status: 'warning',
        requirement: '300 shareholders',
        companyValue: '234 shareholders',
        deadline: '2026-06-15',
        notes: 'Need to expand shareholder base by 66 shareholders',
        documents: ['Shareholder Register', 'Distribution Analysis'],
      },
      {
        id: 'tsx-audit-1',
        category: 'Audit Committee',
        name: 'Audit Committee Independence',
        description: '100% of audit committee must be independent directors',
        status: 'compliant',
        requirement: '3+ independent directors',
        companyValue: '3 independent directors (100%)',
        documents: ['Board Resolution', 'Independence Declarations'],
      },
      {
        id: 'tsx-audit-2',
        category: 'Audit Committee',
        name: 'Financial Expert Requirement',
        description: 'At least one audit committee member must be a financial expert',
        status: 'compliant',
        requirement: '1 financial expert',
        companyValue: 'Sarah Chen - CFO, 15 years experience',
        documents: ['Curriculum Vitae', 'Board Certification'],
      },
      {
        id: 'tsx-board-1',
        category: 'Board of Directors',
        name: 'Board Size & Composition',
        description: 'Board must have minimum 3 directors with 50% independent',
        status: 'warning',
        requirement: '3+ directors (50% independent)',
        companyValue: '4 directors (50% independent)',
        notes: 'At minimum threshold. Monitor for future elections.',
        documents: ['Board Composition Chart', 'Independence Matrix'],
      },
      {
        id: 'tsx-price-1',
        category: 'Share Price',
        name: 'Minimum Share Price',
        description: 'Share price must be at least CAD $4.00',
        status: 'critical',
        requirement: 'CAD $4.00 or higher',
        companyValue: 'CAD $3.75 (IPO pricing)',
        deadline: '2026-07-15',
        notes: 'Below minimum by CAD $0.25. May require stock consolidation post-IPO.',
        documents: ['Pricing Agreement', 'Market Analysis'],
      },
    ],
  },
  NASDAQ: {
    exchangeId: 'NASDAQ',
    exchangeName: 'NASDAQ',
    country: 'United States',
    currency: 'USD',
    completionPercentage: 65,
    criticalCount: 3,
    warningCount: 5,
    deadlineSoon: 7,
    requirements: [
      {
        id: 'nasdaq-float-1',
        category: 'Public Float',
        name: 'Public Float Value (USD)',
        description: 'Minimum public float value of USD $110 million',
        status: 'warning',
        requirement: 'USD $110,000,000',
        companyValue: 'USD $98,700,000',
        deadline: '2026-06-10',
        notes: 'Shortfall: USD $11.3M. Second offering or larger primary offering needed.',
        documents: ['Market Valuation', 'Trading Analysis'],
      },
      {
        id: 'nasdaq-float-2',
        category: 'Public Float',
        name: 'Public Float Percentage',
        description: 'At least 35% of outstanding shares in public hands',
        status: 'critical',
        requirement: '35% of issued shares',
        companyValue: '31.2% of issued shares',
        deadline: '2026-06-10',
        notes: 'Below threshold by 3.8%. Requires additional public offering or share consolidation.',
        documents: ['Cap Table', 'SEC Filing Form S-1'],
      },
      {
        id: 'nasdaq-shares-1',
        category: 'Share Structure',
        name: 'Minimum Public Shares Outstanding',
        description: 'At least 1.25 million shares must be publicly held',
        status: 'compliant',
        requirement: '1,250,000 shares',
        companyValue: '1,580,000 shares',
        documents: ['Prospectus', 'Share Certificate'],
      },
      {
        id: 'nasdaq-price-1',
        category: 'Share Price',
        name: 'Minimum Share Price',
        description: 'Share price must be at least USD $5.00',
        status: 'critical',
        requirement: 'USD $5.00 or higher',
        companyValue: 'USD $4.50 (IPO pricing)',
        deadline: '2026-06-20',
        notes: 'Below minimum by USD $0.50. Requires price adjustment or reverse split.',
        documents: ['Pricing Memo', 'Market Analysis'],
      },
      {
        id: 'nasdaq-bid-volume',
        category: 'Trading Requirements',
        name: 'Bid/Ask Spread Requirement',
        description: 'Regular bid/ask spread must be one cent or less',
        status: 'pending',
        requirement: 'Max USD $0.01 spread',
        documents: ['Trading Rules', 'Market Maker Agreement'],
      },
      {
        id: 'nasdaq-shareholders',
        category: 'Share Structure',
        name: 'Minimum Public Shareholders',
        description: 'At least 400 public shareholders required',
        status: 'warning',
        requirement: '400 shareholders',
        companyValue: '312 shareholders',
        deadline: '2026-07-01',
        notes: 'Need to expand by 88 shareholders through IPO roadshow.',
        documents: ['Investor List', 'Allocation Schedule'],
      },
      {
        id: 'nasdaq-audit-1',
        category: 'Audit Committee',
        name: 'Audit Committee Requirements',
        description: 'Committee must have 3+ independent directors, 1 financial expert',
        status: 'compliant',
        requirement: '3+ independent (1 financial expert)',
        companyValue: '3 independent directors (1 financial expert)',
        documents: ['Audit Committee Charter', 'Board Resolutions'],
      },
      {
        id: 'nasdaq-independence',
        category: 'Board of Directors',
        name: 'Board Independence (Nasdaq Rule 5605)',
        description: 'Majority of board (>50%) must be independent directors',
        status: 'critical',
        requirement: '>50% independent directors',
        companyValue: '50% independent (2 of 4)',
        deadline: '2026-09-01',
        notes: 'At minimum threshold. One more independent director strongly recommended.',
        documents: ['Board Matrix', 'Independence Certifications'],
      },
    ],
  },
  NYSE: {
    exchangeId: 'NYSE',
    exchangeName: 'New York Stock Exchange',
    country: 'United States',
    currency: 'USD',
    completionPercentage: 58,
    criticalCount: 4,
    warningCount: 6,
    deadlineSoon: 3,
    requirements: [
      {
        id: 'nyse-float-1',
        category: 'Public Float',
        name: 'Public Float Value (USD)',
        description: 'Minimum public float value of USD $110 million',
        status: 'critical',
        requirement: 'USD $110,000,000',
        companyValue: 'USD $89,200,000',
        deadline: '2026-06-08',
        notes: 'Shortfall: USD $20.8M. Requires significant additional capital raise.',
        documents: ['Valuation Report', 'IPO Analysis'],
      },
      {
        id: 'nyse-float-2',
        category: 'Public Float',
        name: 'Public Float Percentage',
        description: 'At least 40% of outstanding shares in public hands',
        status: 'critical',
        requirement: '40% of issued shares',
        companyValue: '28.9% of issued shares',
        deadline: '2026-06-08',
        notes: 'Significantly below threshold. May not qualify for NYSE listing at this time.',
        documents: ['Cap Table', 'Market Analysis'],
      },
      {
        id: 'nyse-shares-1',
        category: 'Share Structure',
        name: 'Minimum Public Shares Outstanding',
        description: 'At least 2.0 million shares must be publicly held',
        status: 'warning',
        requirement: '2,000,000 shares',
        companyValue: '1,450,000 shares',
        deadline: '2026-06-15',
        notes: 'Shortfall: 550,000 shares. Consider larger IPO offering.',
        documents: ['Registration Statement', 'Share Ledger'],
      },
      {
        id: 'nyse-price-1',
        category: 'Share Price',
        name: 'Minimum Share Price',
        description: 'Share price must be at least USD $4.00',
        status: 'compliant',
        requirement: 'USD $4.00 or higher',
        companyValue: 'USD $4.50 (IPO pricing)',
        documents: ['Pricing Memo'],
      },
      {
        id: 'nyse-shareholders',
        category: 'Share Structure',
        name: 'Minimum Public Shareholders',
        description: 'At least 400 public shareholders required',
        status: 'critical',
        requirement: '400 shareholders',
        companyValue: '267 shareholders',
        deadline: '2026-07-08',
        notes: 'Shortfall of 133 shareholders. Aggressive marketing needed.',
        documents: ['Book Building', 'Allocation Schedule'],
      },
      {
        id: 'nyse-audit-1',
        category: 'Audit Committee',
        name: 'Audit Committee Independence & Expertise',
        description: '100% independent, 1 audit committee financial expert required',
        status: 'warning',
        requirement: '100% independent (1 expert)',
        companyValue: '2 of 3 independent (1 expert)',
        deadline: '2026-07-20',
        notes: 'Need one more independent director on audit committee.',
        documents: ['Committee Charter', 'Board Resolutions'],
      },
      {
        id: 'nyse-compensation',
        category: 'Compensation Committee',
        name: 'Compensation Committee Requirements',
        description: '100% independent directors required',
        status: 'critical',
        requirement: '100% independent',
        companyValue: '50% independent (1 of 2)',
        deadline: '2026-06-30',
        notes: 'Non-compliant. Must add independent director or restructure committee.',
        documents: ['Committee Charter', 'Independence Declarations'],
      },
      {
        id: 'nyse-nominating',
        category: 'Nominating Committee',
        name: 'Nominating/Governance Committee Independence',
        description: '100% independent directors required for this committee',
        status: 'critical',
        requirement: '100% independent',
        companyValue: '50% independent (1 of 2)',
        deadline: '2026-06-30',
        notes: 'Board reorganization needed to meet NYSE requirements.',
        documents: ['Committee Charter', 'Board Composition Matrix'],
      },
    ],
  },
}

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'Public Float': { icon: <TrendingUp className="w-5 h-5" />, color: 'bg-blue-50', label: 'Public Float' },
  'Share Structure': { icon: <BarChart3 className="w-5 h-5" />, color: 'bg-purple-50', label: 'Share Structure' },
  'Audit Committee': { icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-50', label: 'Audit Committee' },
  'Board of Directors': { icon: <Users className="w-5 h-5" />, color: 'bg-amber-50', label: 'Board of Directors' },
  'Share Price': { icon: <Target className="w-5 h-5" />, color: 'bg-red-50', label: 'Share Price' },
  'Trading Requirements': { icon: <Zap className="w-5 h-5" />, color: 'bg-indigo-50', label: 'Trading Requirements' },
  'Compensation Committee': { icon: <Users className="w-5 h-5" />, color: 'bg-orange-50', label: 'Compensation Committee' },
  'Nominating Committee': { icon: <Settings className="w-5 h-5" />, color: 'bg-cyan-50', label: 'Nominating Committee' },
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    compliant: { bg: 'bg-green-100', text: 'text-green-700', label: 'Compliant' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warning' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
    pending: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
  }[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Unknown' }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {status === 'compliant' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'warning' && <AlertCircle className="w-3 h-3" />}
      {status === 'critical' && <AlertCircle className="w-3 h-3" />}
      {config.label}
    </span>
  )
}

function CompletionTracker({ percentage }: { percentage: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="label font-medium text-slate-700">Completion</span>
        <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function RequirementCard({ requirement }: { requirement: Requirement }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const categoryConfig = CATEGORY_CONFIG[requirement.category] || {
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-slate-50',
    label: requirement.category,
  }

  return (
    <motion.div
      layout
      className={`rounded-lg border ${
        requirement.status === 'critical'
          ? 'border-red-300 bg-red-50'
          : requirement.status === 'warning'
            ? 'border-yellow-300 bg-yellow-50'
            : requirement.status === 'compliant'
              ? 'border-green-300 bg-green-50'
              : 'border-slate-300 bg-slate-50'
      } p-4 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${categoryConfig.color}`}>
              {categoryConfig.icon}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{requirement.name}</h4>
              <p className="caption-sm text-slate-600">{requirement.category}</p>
            </div>
          </div>
          <p className="body-sm text-slate-600 mb-3">{requirement.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="label-sm font-medium text-slate-600 block mb-1">Requirement</span>
              <span className="label font-semibold text-slate-900">{requirement.requirement}</span>
            </div>
            {requirement.companyValue !== undefined && (
              <div>
                <span className="label-sm font-medium text-slate-600 block mb-1">Company Value</span>
                <span className="label font-semibold text-slate-900">{requirement.companyValue}</span>
              </div>
            )}
          </div>

          <StatusBadge status={requirement.status} />
        </div>

        <div className="flex items-center gap-2">
          {requirement.deadline && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="label-sm font-semibold text-orange-700">{requirement.deadline}</span>
            </div>
          )}
          <ChevronDown
            className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-slate-300 space-y-3"
          >
            {requirement.notes && (
              <div className="bg-white rounded p-3 border border-slate-200">
                <p className="body-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Notes: </span>
                  {requirement.notes}
                </p>
              </div>
            )}

            {requirement.documents && requirement.documents.length > 0 && (
              <div>
                <h5 className="label-sm font-semibold text-slate-600 mb-2">Related Documents</h5>
                <div className="flex flex-wrap gap-2">
                  {requirement.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-200 caption-sm text-slate-700">
                      <FileText className="w-3 h-3" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button className="caption-sm px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" />
                Download Details
              </button>
              <button className="caption-sm px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ExchangeStats({ data }: { data: ExchangeRequirements }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <motion.div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <span className="label-sm font-semibold text-slate-600">Completion</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-bold text-emerald-700">{data.completionPercentage}%</p>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center justify-between mb-2">
          <span className="label-sm font-semibold text-slate-600">Critical</span>
          <AlertCircle className="w-4 h-4 text-red-600" />
        </div>
        <p className="text-2xl font-bold text-red-700">{data.criticalCount}</p>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="label-sm font-semibold text-slate-600">Warnings</span>
          <AlertCircle className="w-4 h-4 text-yellow-600" />
        </div>
        <p className="text-2xl font-bold text-yellow-700">{data.warningCount}</p>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <span className="label-sm font-semibold text-slate-600">Deadline Soon</span>
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <p className="text-2xl font-bold text-orange-700">{data.deadlineSoon}d</p>
      </motion.div>
    </div>
  )
}

function CategorySection({ category, requirements }: { category: string; requirements: Requirement[] }) {
  const config = CATEGORY_CONFIG[category] || {
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-slate-50',
    label: category,
  }

  const compliantCount = requirements.filter(r => r.status === 'compliant').length
  const totalCount = requirements.length

  return (
    <motion.div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className={`${config.color} p-4 border-b border-slate-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white">
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{config.label}</h3>
              <p className="caption-sm text-slate-600">
                {compliantCount} of {totalCount} requirements met
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span className="h4 font-bold text-slate-900">
              {Math.round((compliantCount / totalCount) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {requirements.map((req) => (
          <RequirementCard key={req.id} requirement={req} />
        ))}
      </div>
    </motion.div>
  )
}

export default function ListingRequirementsPage() {
  const [selectedExchange, setSelectedExchange] = useState<string>('TSX')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const currentData = EXCHANGE_DATA[selectedExchange]

  const filteredRequirements = useMemo(() => {
    if (filterStatus === 'all') return currentData.requirements
    return currentData.requirements.filter(r => r.status === filterStatus)
  }, [currentData.requirements, filterStatus])

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, Requirement[]> = {}
    filteredRequirements.forEach(req => {
      if (!grouped[req.category]) {
        grouped[req.category] = []
      }
      grouped[req.category].push(req)
    })
    return grouped
  }, [filteredRequirements])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Listing Requirements</h1>
              <p className="body-sm text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Track exchange-specific requirements and compliance status
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Exchange Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm"
        >
          <h2 className="h4 font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Select Exchange
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXCHANGES.map(exchange => (
              <motion.button
                key={exchange.id}
                onClick={() => setSelectedExchange(exchange.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedExchange === exchange.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-bold body text-slate-900">{exchange.name}</div>
                <div className="caption-sm text-slate-600 mt-1">{exchange.country} • {exchange.currency}</div>
                {selectedExchange === exchange.id && (
                  <div className="mt-2 flex items-center gap-1 text-blue-600 label font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Selected
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ExchangeStats data={currentData} />
        </motion.div>

        {/* Completion Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm"
        >
          <CompletionTracker percentage={currentData.completionPercentage} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-2 flex-wrap"
        >
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
              filterStatus === 'all'
                ? 'text-white border-slate-300'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            style={{
              background: filterStatus === 'all' ? '#E8312A' : 'white'
            }}
          >
            <Filter className="w-4 h-4" />
            All Requirements
          </button>
          {(['compliant', 'warning', 'critical', 'pending'] as const).map(status => {
            const counts = {
              compliant: currentData.requirements.filter(r => r.status === 'compliant').length,
              warning: currentData.requirements.filter(r => r.status === 'warning').length,
              critical: currentData.requirements.filter(r => r.status === 'critical').length,
              pending: currentData.requirements.filter(r => r.status === 'pending').length,
            }
            const config = {
              compliant: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
              warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
              critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
              pending: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
            }[status]

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                  filterStatus === status
                    ? `${config.bg} border-slate-900 font-semibold`
                    : `${config.bg} ${config.border} ${config.text} hover:border-slate-300`
                }`}
              >
                {status} ({counts[status]})
              </button>
            )
          })}
        </motion.div>

        {/* Requirements by Category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          {Object.entries(groupedByCategory).map(([category, requirements], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
            >
              <CategorySection category={category} requirements={requirements} />
            </motion.div>
          ))}

          {Object.keys(groupedByCategory).length === 0 && (
            <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No requirements match the selected filter.</p>
            </div>
          )}
        </motion.div>

        {/* Bottom action cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Document Management</h3>
                <p className="body-sm text-slate-600 mb-4">Link and track required documents for each requirement</p>
                <button className="body-sm px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Manage Documents
                </button>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Deadline Tracking</h3>
                <p className="body-sm text-slate-600 mb-4">Set reminders and track critical compliance deadlines</p>
                <button className="body-sm px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Manage Deadlines
                </button>
              </div>
              <Calendar className="w-12 h-12 text-emerald-200" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
