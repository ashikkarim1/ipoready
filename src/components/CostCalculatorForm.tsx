'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, ComposedChart } from 'recharts'
import { motion } from 'framer-motion'
import { Download, Loader2, AlertCircle, Save, CheckCircle, TrendingUp, DollarSign, Calendar, Info, ChevronDown, Zap, Plus } from 'lucide-react'

const FormSchema = z.object({
  companyRevenue: z.coerce.number().positive('Revenue must be greater than 0'),
  selectedExchange: z.enum(['NYSE', 'NASDAQ', 'TSX', 'CSE', 'OTHER']),
  complexityLevel: z.enum(['simple', 'medium', 'complex']),
  timelineMonths: z.coerce.number().int().min(3).max(12),
  companySize: z.enum(['early', 'growth', 'mature']),
  industry: z.enum(['tech', 'healthcare', 'finance', 'manufacturing', 'other']),
  comparableCompany: z.string().optional(),
  scenarioType: z.enum(['traditional-ipo', 'direct-listing', 'spac']).optional(),
})

type FormData = z.infer<typeof FormSchema>

interface CostBreakdown {
  legal: number
  accounting: number
  underwriting: number
  printing: number
  filing: number
  contingency: number
}

interface CalculationResult {
  breakdown: CostBreakdown
  subtotal: number
  total: number
  ipoSizeEstimate: number
  costAsPercentageOfIPO: string
  phasedBreakdown: PhaseBreakdown[]
  marketRange: { min: number; max: number }
}

interface PhaseBreakdown {
  phase: string
  months: string
  costs: number
  description: string
}

const COLORS = ['#E8312A', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

const COMPARABLE_COMPANIES = {
  tech: [
    { name: 'Stripe IPO Profile (SaaS, $100M+ ARR)', estimatedCosts: 15000000 },
    { name: 'Figma Profile (Design, $400M+ valuation)', estimatedCosts: 12000000 },
    { name: 'Notion Profile (Productivity, $10B valuation)', estimatedCosts: 18000000 },
  ],
  healthcare: [
    { name: 'Biotech (Early Stage, <$100M revenue)', estimatedCosts: 8000000 },
    { name: 'MedTech (Mature, >$100M revenue)', estimatedCosts: 14000000 },
  ],
  finance: [
    { name: 'Fintech (High complexity)', estimatedCosts: 20000000 },
    { name: 'Insurance (Regulated)', estimatedCosts: 16000000 },
  ],
}

const MARKET_RANGES = {
  legal: { min: 2000000, max: 7000000 },
  accounting: { min: 1500000, max: 4000000 },
  underwriting: { min: 3000000, max: 8000000 },
  printing: { min: 500000, max: 1500000 },
  filing: { min: 300000, max: 800000 },
}

const HIDDEN_COSTS = [
  { id: 'ir-hires', label: 'Investor Relations Staff', costRange: '$500K–1M (first year)', description: 'New hires for IR team and corporate communications' },
  { id: 'stock-comp', label: 'Stock-Based Compensation Programs', costRange: '$1–3M setup', description: 'New equity programs and administration infrastructure' },
  { id: 'insurance', label: 'Enhanced D&O Insurance', costRange: '$300K–1M annually', description: 'Director & Officer liability increases significantly' },
  { id: 'transition', label: 'Transition & Integration Costs', costRange: '$500K–2M', description: 'Systems, training, and organizational restructuring' },
  { id: 'compliance', label: 'Year 1 Public Company Compliance', costRange: '$2–3M', description: 'SEC staff, enhanced controls, quarterly earnings management' },
  { id: 'board', label: 'Board Expansion & Compensation', costRange: '$500K–2M', description: 'Independent directors, board committees, compensation' },
]

const PATH_COMPARISON = [
  {
    path: 'Traditional IPO',
    totalCost: 17500000,
    timeline: '12 months',
    capRaised: 100000000,
    netProceeds: 82500000,
    pros: ['Full capital raise', 'Brand awareness', 'Currency for M&A'],
    cons: ['Highest costs', 'Longest timeline', 'Most regulatory scrutiny'],
  },
  {
    path: 'Direct Listing',
    totalCost: 8000000,
    timeline: '8 months',
    capRaised: 100000000,
    netProceeds: 92000000,
    pros: ['Lower costs', 'No dilution to new shares', 'Faster timeline'],
    cons: ['No capital raise', 'Less marketing', 'Shareholder lock-up risk'],
  },
  {
    path: 'SPAC Merger',
    totalCost: 12000000,
    timeline: '9 months',
    capRaised: 100000000,
    netProceeds: 88000000,
    pros: ['Lower than IPO', 'Fixed timeline', 'Certainty of close'],
    cons: ['SPAC fees', 'Sponsor promote', 'Shareholder votes'],
  },
]

export function CostCalculatorForm() {
  const [activeTab, setActiveTab] = useState<'estimate' | 'compare' | 'impact'>('estimate')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [expandedHiddenCost, setExpandedHiddenCost] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>('traditional-ipo')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      companyRevenue: 50000000,
      selectedExchange: 'NASDAQ',
      complexityLevel: 'medium',
      timelineMonths: 6,
      companySize: 'growth',
      industry: 'tech',
      comparableCompany: '',
    },
  })

  const timelineMonths = watch('timelineMonths')
  const companySize = watch('companySize')
  const industry = watch('industry')
  const companyRevenue = watch('companyRevenue')

  // Auto-populate based on comparable company
  const handleComparableChange = (company: string) => {
    if (company === 'stripe') {
      setValue('companyRevenue', 100000000)
      setValue('complexityLevel', 'medium')
    } else if (company === 'figma') {
      setValue('companyRevenue', 80000000)
      setValue('complexityLevel', 'medium')
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/financial/cost-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Calculation failed')

      const result = await response.json()
      setResult(result.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)
    try {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (!result) return
    const csv = `Cost Category,Amount\n${Object.entries(result.breakdown)
      .map(([k, v]) => `${k.toUpperCase()},${v}`)
      .join('\n')}\nTOTAL,${result.total}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ipo-cost-estimate.csv'
    a.click()
  }

  const chartData = result
    ? [
        { name: 'Legal', value: result.breakdown.legal, fill: COLORS[0] },
        { name: 'Accounting', value: result.breakdown.accounting, fill: COLORS[1] },
        { name: 'Underwriting', value: result.breakdown.underwriting, fill: COLORS[2] },
        { name: 'Printing', value: result.breakdown.printing, fill: COLORS[3] },
        { name: 'Filing', value: result.breakdown.filing, fill: COLORS[4] },
        { name: 'Contingency', value: result.breakdown.contingency, fill: COLORS[5] },
      ]
    : []

  const totalHiddenCosts = HIDDEN_COSTS.reduce((sum, cost) => sum + (cost.costRange.includes('1M') ? 1000000 : 500000), 0)

  const waterfallData = result
    ? [
        { category: 'Gross Proceeds', value: result.ipoSizeEstimate, fill: '#10b981' },
        { category: 'Direct Costs', value: -result.total, fill: '#ef4444' },
        { category: 'Est. Hidden Costs', value: -(totalHiddenCosts * 0.5), fill: '#f59e0b' },
        { category: 'Net to Company', value: result.ipoSizeEstimate - result.total - totalHiddenCosts * 0.5, fill: '#E8312A' },
      ]
    : []

  const postIPOCosts = [
    { category: 'SEC Compliance Staff', annual: 2500000 },
    { category: 'Enhanced Investor Relations', annual: 1500000 },
    { category: 'Increased Insurance', annual: 750000 },
    { category: 'Board & Audit Committee', annual: 1000000 },
    { category: 'Quarterly Earnings Management', annual: 800000 },
  ]

  return (
    <motion.div style={{ background: '#F7F6F4', minHeight: '100vh' }} suppressHydrationWarning>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto" style={{ paddingTop: '4.5rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2"
            style={{ marginBottom: '1.5rem' }}
          >
            <span
              className="pill text-xs font-bold uppercase tracking-wider"
              style={{ background: '#FDECEB', color: '#E8312A' }}
            >
              <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
              Financial Planning
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="serif"
            style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}
          >
            Calculate Your<br />
            <span style={{ color: '#E8312A' }}>IPO Cost Estimate</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-lg leading-relaxed"
            style={{ marginBottom: '2.5rem', maxWidth: '620px', margin: '0 auto 2.5rem', color: '#666666' }}
          >
            Comprehensive cost estimation with benchmarking, comparable companies, and scenario analysis for your IPO journey.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto" style={{ paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="flex gap-4 border-b"
          style={{ borderColor: '#E8E7E5' }}
        >
          <button
            onClick={() => setActiveTab('estimate')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'estimate'
                ? 'border-b-2'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
            style={{
              color: activeTab === 'estimate' ? '#E8312A' : '#666666',
              borderBottomColor: activeTab === 'estimate' ? '#E8312A' : 'transparent',
            }}
          >
            <DollarSign className="inline mr-2 h-5 w-5" />
            Cost Estimate
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'compare'
                ? 'border-b-2'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
            style={{
              color: activeTab === 'compare' ? '#E8312A' : '#666666',
              borderBottomColor: activeTab === 'compare' ? '#E8312A' : 'transparent',
            }}
          >
            <TrendingUp className="inline mr-2 h-5 w-5" />
            Compare Paths
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'impact'
                ? 'border-b-2'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
            style={{
              color: activeTab === 'impact' ? '#E8312A' : '#666666',
              borderBottomColor: activeTab === 'impact' ? '#E8312A' : 'transparent',
            }}
          >
            <TrendingUp className="inline mr-2 h-5 w-5" />
            Financial Impact
          </button>
        </motion.div>

        {/* TAB 1: COST ESTIMATE */}
        {activeTab === 'estimate' && (
          <div className="space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 space-y-8">
              {/* Profile Section */}
              <div>
                <h2 className="h4 text-slate-900 mb-6">Company Profile</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="label font-medium text-slate-700 mb-2 block">Company Revenue</label>
                    <input
                      type="number"
                      {...register('companyRevenue')}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="50000000"
                    />
                    {errors.companyRevenue && <p className="caption-sm text-red-600 mt-1">{errors.companyRevenue.message}</p>}
                  </div>

                  <div>
                    <label className="label font-medium text-slate-700 mb-2 block">Industry</label>
                    <select {...register('industry')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500">
                      <option value="tech">Technology</option>
                      <option value="healthcare">Healthcare/Biotech</option>
                      <option value="finance">Financial Services</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="label font-medium text-slate-700 mb-2 block">Company Stage</label>
                    <select {...register('companySize')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500">
                      <option value="early">Early Growth</option>
                      <option value="growth">Growth</option>
                      <option value="mature">Mature</option>
                    </select>
                  </div>

                  <div>
                    <label className="label font-medium text-slate-700 mb-2 block">Exchange</label>
                    <select {...register('selectedExchange')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500">
                      <option value="NASDAQ">NASDAQ</option>
                      <option value="NYSE">NYSE</option>
                      <option value="TSX">TSX</option>
                      <option value="CSE">CSE</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Comparable Companies */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="label font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Select Comparable Company
                </h3>
                <select
                  onChange={(e) => {
                    setValue('comparableCompany', e.target.value)
                    handleComparableChange(e.target.value)
                  }}
                  className="w-full px-4 py-2 border border-red-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Auto-populate from comparable --</option>
                  {industry === 'tech' &&
                    COMPARABLE_COMPANIES.tech.map((company) => (
                      <option key={company.name} value={company.name}>
                        {company.name} (est. ${(company.estimatedCosts / 1000000).toFixed(1)}M)
                      </option>
                    ))}
                  {industry === 'healthcare' &&
                    COMPARABLE_COMPANIES.healthcare.map((company) => (
                      <option key={company.name} value={company.name}>
                        {company.name} (est. ${(company.estimatedCosts / 1000000).toFixed(1)}M)
                      </option>
                    ))}
                </select>
                <p className="caption-sm text-red-800 mt-2">Companies like yours typically spend in the ranges shown above</p>
              </div>

              {/* Calculator Settings */}
              <div>
                <h2 className="h4 text-slate-900 mb-6">IPO Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="label font-medium text-slate-700 mb-2 block">Complexity Level</label>
                    <select
                      {...register('complexityLevel')}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="simple">Simple (Domestic, clean cap table)</option>
                      <option value="medium">Medium (Standard complexity)</option>
                      <option value="complex">Complex (Intl, litigation, multiple currencies)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label font-medium text-slate-700 mb-2 block">Timeline: {timelineMonths} months</label>
                    <input type="range" min="3" max="12" {...register('timelineMonths')} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    <p className="caption-sm text-slate-600 mt-1">Accelerated timelines increase costs by ~10%</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              style={{ background: '#E8312A' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#D41F14')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}>
                {isLoading ? <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> : null}
                Calculate Costs
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-8">
                {/* Cost Breakdown with Market Context */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h2 className="h3 text-slate-900 mb-6">Fee Breakdown & Market Context</h2>
                  <div className="space-y-4">
                    {Object.entries(result.breakdown).map(([key, value]) => {
                      const range = MARKET_RANGES[key as keyof typeof MARKET_RANGES]
                      const isInRange = value >= range.min && value <= range.max
                      return (
                        <div key={key} className="border-b border-slate-100 pb-4 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="label font-semibold text-slate-900 capitalize">{key}</h3>
                              <p className={`caption-sm ${isInRange ? 'text-green-600' : 'text-amber-600'}`}>
                                Market range: ${(range.min / 1000000).toFixed(1)}M – ${(range.max / 1000000).toFixed(1)}M
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="h4 text-slate-900">${(value / 1000000).toFixed(1)}M</p>
                              <p className={`caption-sm ${isInRange ? 'text-green-600' : 'text-amber-600'}`}>{isInRange ? '✓ Within range' : '⚠ Above typical'}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Phased Timeline */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h2 className="h3 text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Phased Cost Breakdown
                  </h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <p className="label font-semibold text-slate-700">Phase</p>
                      </div>
                      <div>
                        <p className="label font-semibold text-slate-700">Timeline</p>
                      </div>
                      <div>
                        <p className="label font-semibold text-slate-700">Estimated Cost</p>
                      </div>
                      <div>
                        <p className="label font-semibold text-slate-700">Focus Area</p>
                      </div>
                    </div>
                    {[
                      { phase: 'Pre-Filing', months: 'Months 0–3', pct: 0.15, desc: 'Due diligence, filing prep' },
                      { phase: 'Filing', months: 'Months 3–8', pct: 0.35, desc: 'SEC review, legal, accounting' },
                      { phase: 'Roadshow', months: 'Months 8–11', pct: 0.3, desc: 'Underwriting, marketing, travel' },
                      { phase: 'Closing & Launch', months: 'Month 12', pct: 0.2, desc: 'Final costs, trading launch' },
                    ].map((phase, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="body-sm font-medium text-slate-900">{phase.phase}</p>
                        </div>
                        <div>
                          <p className="body-sm text-slate-600">{phase.months}</p>
                        </div>
                        <div>
                          <p className="body-sm font-semibold text-slate-900">${((result.total * phase.pct) / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="body-sm text-slate-600">{phase.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h2 className="h3 text-slate-900 mb-6">Cost Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: any) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Bar dataKey="value" fill="#E8312A">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Hidden Costs Checklist */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h2 className="h3 text-amber-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Hidden Costs to Consider
                  </h2>
                  <div className="space-y-2">
                    {HIDDEN_COSTS.map((cost) => (
                      <div key={cost.id} className="border border-amber-100 rounded-lg bg-white">
                        <button
                          onClick={() => setExpandedHiddenCost(expandedHiddenCost === cost.id ? null : cost.id)}
                          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-amber-50 transition"
                        >
                          <div className="flex-1">
                            <p className="label font-semibold text-amber-900">{cost.label}</p>
                            <p className="caption-sm text-amber-700">{cost.costRange}</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-amber-600 transition ${expandedHiddenCost === cost.id ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedHiddenCost === cost.id && (
                          <div className="px-4 py-3 border-t border-amber-100 bg-amber-50">
                            <p className="body-sm text-amber-900">{cost.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary & Actions */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="border rounded-lg p-6">
                    <p className="caption-sm text-red-700 mb-1">Total Direct Costs</p>
                    <p className="h2 text-red-900">${(result.total / 1000000).toFixed(1)}M</p>
                    <p className="caption-sm text-red-700 mt-2">As % of IPO: {result.costAsPercentageOfIPO}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
                    <p className="caption-sm text-amber-700 mb-1">Est. Hidden Costs</p>
                    <p className="h2 text-amber-900">${(totalHiddenCosts / 2 / 1000000).toFixed(1)}M–${(totalHiddenCosts / 1000000).toFixed(1)}M</p>
                    <p className="caption-sm text-amber-700 mt-2">Year 1 public company</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <p className="caption-sm text-green-700 mb-1">Est. IPO Gross Proceeds</p>
                    <p className="h2 text-green-900">${(result.ipoSizeEstimate / 1000000).toFixed(1)}M</p>
                    <p className="caption-sm text-green-700 mt-2">Based on your profile</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Estimate
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800">Estimate saved successfully</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPARE PATHS */}
        {activeTab === 'compare' && (
          <div className="space-y-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="body text-red-900">
                Compare different paths to going public. Each path has different cost implications, timelines, and strategic implications. Traditional IPO maximizes capital raise but has the
                highest costs. Direct listing reduces costs and dilution but provides no capital raise. SPAC offers speed and certainty.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {PATH_COMPARISON.map((path, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-6 transition cursor-pointer ${
                    selectedScenario === path.path.toLowerCase().replace(' ', '-')
                      ? 'border-red-600 bg-red-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-red-300'
                  }`}
                  onClick={() => setSelectedScenario(path.path.toLowerCase().replace(' ', '-'))}
                >
                  <h3 className="h4 text-slate-900 mb-4">{path.path}</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="caption text-slate-600">Total Cost</p>
                      <p className="h3 text-slate-900">${(path.totalCost / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="caption text-slate-600">Timeline</p>
                      <p className="h4 text-slate-900">{path.timeline}</p>
                    </div>
                    <div>
                      <p className="caption text-slate-600">Net Proceeds</p>
                      <p className="h3 text-green-600">${(path.netProceeds / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 border-t border-slate-200 pt-4">
                    <div>
                      <p className="label font-semibold text-green-700 text-sm mb-2">✓ Pros</p>
                      <ul className="space-y-1">
                        {path.pros.map((pro, pidx) => (
                          <li key={pidx} className="caption-sm text-slate-700">
                            • {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="label font-semibold text-red-700 text-sm mb-2">✗ Cons</p>
                      <ul className="space-y-1">
                        {path.cons.map((con, cidx) => (
                          <li key={cidx} className="caption-sm text-slate-700">
                            • {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="h3 text-slate-900 mb-6">Detailed Path Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 label font-semibold text-slate-900">Metric</th>
                      {PATH_COMPARISON.map((path) => (
                        <th key={path.path} className="text-right py-3 px-4 label font-semibold text-slate-900">
                          {path.path}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 body-sm font-medium text-slate-900">Total Costs</td>
                      {PATH_COMPARISON.map((path) => (
                        <td key={path.path} className="text-right py-3 px-4 body-sm text-slate-900">
                          ${(path.totalCost / 1000000).toFixed(1)}M
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 body-sm font-medium text-slate-900">Timeline</td>
                      {PATH_COMPARISON.map((path) => (
                        <td key={path.path} className="text-right py-3 px-4 body-sm text-slate-900">
                          {path.timeline}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 body-sm font-medium text-slate-900">Capital Raised</td>
                      {PATH_COMPARISON.map((path) => (
                        <td key={path.path} className="text-right py-3 px-4 body-sm text-slate-900">
                          ${(path.capRaised / 1000000).toFixed(0)}M
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-green-50 border-t-2 border-green-200">
                      <td className="py-3 px-4 body-sm font-bold text-green-900">Net to Company</td>
                      {PATH_COMPARISON.map((path) => (
                        <td key={path.path} className="text-right py-3 px-4 h4 text-green-900">
                          ${(path.netProceeds / 1000000).toFixed(1)}M
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL IMPACT */}
        {activeTab === 'impact' && result && (
          <div className="space-y-8">
            {/* Waterfall Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="h3 text-slate-900 mb-6">Net Proceeds Waterfall</h2>
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 mb-6">
                <p className="body-sm text-slate-700">
                  This shows how gross proceeds flow through direct costs and hidden costs to net cash for your company. The waterfall helps you understand your true net proceeds after all
                  IPO-related expenses.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={waterfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: any) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="value" fill="#E8312A">
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <p className="caption text-green-700 mb-1">Gross Proceeds (IPO)</p>
                <p className="h2 text-green-900">${(result.ipoSizeEstimate / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                <p className="caption text-red-700 mb-1">Total IPO Costs</p>
                <p className="h2 text-red-900">–${(result.total / 1000000).toFixed(1)}M</p>
              </div>
              <div className="border rounded-lg p-6">
                <p className="caption text-red-700 mb-1">Net Proceeds to Company</p>
                <p className="h2 text-red-900">${((result.ipoSizeEstimate - result.total) / 1000000).toFixed(1)}M</p>
                <p className="caption-sm text-red-700 mt-2">{((((result.ipoSizeEstimate - result.total) / result.ipoSizeEstimate) * 100).toFixed(1))}% of gross</p>
              </div>
            </div>

            {/* Post-IPO Costs */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="h3 text-slate-900 mb-6">Year 1 Public Company Costs (Ongoing)</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="body-sm text-red-900">
                  These are <strong>additional annual costs</strong> you'll incur being a public company. The IPO is a one-time event, but these costs continue every year. Budget these into
                  your financial projections.
                </p>
              </div>
              <div className="space-y-3 mb-6">
                {postIPOCosts.map((cost, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                    <p className="body-sm font-medium text-slate-900">{cost.category}</p>
                    <p className="h4 text-slate-900">${(cost.annual / 1000000).toFixed(1)}M/year</p>
                  </div>
                ))}
                <div className="bg-slate-100 rounded-lg p-4 mt-6 flex justify-between items-center">
                  <p className="label font-bold text-slate-900">Total Annual Public Company Costs</p>
                  <p className="h3 text-slate-900">${(postIPOCosts.reduce((sum, c) => sum + c.annual, 0) / 1000000).toFixed(1)}M</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="body-sm text-amber-900">
                  <strong>💡 Planning tip:</strong> Your IPO costs ($
                  {(result.total / 1000000).toFixed(1)}M) are paid mostly upfront. Your public company costs ($
                  {(postIPOCosts.reduce((sum, c) => sum + c.annual, 0) / 1000000).toFixed(1)}
                  M/year) are ongoing. Over 5 years, being public costs ${((postIPOCosts.reduce((sum, c) => sum + c.annual, 0) * 5 + result.total) / 1000000).toFixed(1)}M total.
                </p>
              </div>
            </div>

            {/* Comparison to Gross Proceeds */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="h3 text-slate-900 mb-6">Cost Breakdown as % of IPO</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="body-sm font-medium text-slate-900">Direct IPO Costs</p>
                    <p className="body-sm font-bold text-red-600">{((result.total / result.ipoSizeEstimate) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(result.total / result.ipoSizeEstimate) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="body-sm font-medium text-slate-900">Est. Hidden Costs</p>
                    <p className="body-sm font-bold text-amber-600">{((totalHiddenCosts * 0.5 / result.ipoSizeEstimate) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${(totalHiddenCosts * 0.5 / result.ipoSizeEstimate) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="body-sm font-medium text-slate-900">Net to Company</p>
                    <p className="body-sm font-bold text-green-600">{(((result.ipoSizeEstimate - result.total - totalHiddenCosts * 0.5) / result.ipoSizeEstimate) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((result.ipoSizeEstimate - result.total - totalHiddenCosts * 0.5) / result.ipoSizeEstimate) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  )
}