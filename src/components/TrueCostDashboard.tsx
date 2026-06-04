'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Cell
} from 'recharts'
import {
  Download, Mail, Info, AlertCircle, TrendingUp, DollarSign, ChevronDown,
  FileText, Loader2
} from 'lucide-react'
import {
  calculateAnnualCost, getYear1MonthlyBreakdown, formatCurrency, getCategoryColor,
  EXCHANGE_COST_PROFILES, COST_COMPONENTS, CostCalculationOptions, CostCategory
} from '@/lib/true-cost-data'
import { getExchangeConfig } from '@/lib/exchange-config'

interface CompanyData {
  id: string
  name: string
  targetExchange: string
  currency: string
}

interface YearForecast {
  year: number
  total: number
  breakdown: Record<CostCategory, number>
}

const YEARS_TO_FORECAST = [1, 2, 3, 5]

export function TrueCostDashboard() {
  const { data: session, status } = useSession()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cost calculation options
  const [auditorComplexity, setAuditorComplexity] = useState<'simple' | 'medium' | 'complex'>('medium')
  const [irBudgetSize, setIrBudgetSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [toggles, setToggles] = useState({
    irAdditional: false,
    governanceServices: false,
    listingAgent: false,
  })

  // Fetch company data with fallback
  useEffect(() => {
    async function fetchCompany() {
      try {
        if (status === 'loading') return
        if (status === 'unauthenticated') {
          setError('Please log in to view this page')
          setLoading(false)
          return
        }

        try {
          const res = await fetch('/api/company')
          if (res.ok) {
            const data = await res.json()
            setCompany({
              id: data.company.id,
              name: data.company.name,
              targetExchange: data.company.targetExchange?.toLowerCase() || 'tsxv',
              currency: data.company.currency || 'USD',
            })
            setLoading(false)
            return
          }
        } catch (fetchErr) {
          // Fallback: use default data if API fails
          console.warn('Failed to fetch company, using defaults:', fetchErr)
        }

        // Fallback to demo company data
        setCompany({
          id: 'company-demo',
          name: 'VentureTech Innovations Inc',
          targetExchange: 'tsxv',
          currency: 'CAD',
        })
        setLoading(false)
      } catch (err) {
        console.error('Error in fetchCompany:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }

    fetchCompany()
  }, [status])

  const options: CostCalculationOptions = useMemo(() => ({
    auditorComplexity,
    irBudgetSize,
    discretionaryToggles: toggles,
  }), [auditorComplexity, irBudgetSize, toggles])

  // Calculate forecasts
  const yearForecasts = useMemo(() => {
    if (!company?.targetExchange) return []
    return YEARS_TO_FORECAST.map(year => {
      const { breakdown, total } = calculateAnnualCost(company.targetExchange, year, options)
      return { year, total, breakdown }
    })
  }, [company?.targetExchange, options])

  // Monthly breakdown for Year 1
  const monthlyData = useMemo(() => {
    if (!company?.targetExchange) return []
    return getYear1MonthlyBreakdown(company.targetExchange, options)
  }, [company?.targetExchange, options])

  // Prepare chart data
  const yearlyChartData = useMemo(() => {
    return yearForecasts.map(forecast => {
      const profile = EXCHANGE_COST_PROFILES[company?.targetExchange || '']
      const categories = profile?.components || []

      return {
        name: `Year ${forecast.year}`,
        total: forecast.total,
        ...Object.fromEntries(
          categories.map(cat => [cat, forecast.breakdown[cat as CostCategory] || 0])
        ),
      }
    })
  }, [yearForecasts, company?.targetExchange])

  const monthlyChartData = useMemo(() => {
    return monthlyData.map(month => ({
      name: month.monthName.slice(0, 3),
      total: month.total,
      fullTotal: month.total,
    }))
  }, [monthlyData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#E8312A' }} />
          <p className="text-gray-600">Loading your cost analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-red-800">{error || 'Company data not found. Please ensure your profile is complete.'}</p>
          </div>
        </div>
      </div>
    )
  }

  const profile = EXCHANGE_COST_PROFILES[company.targetExchange]
  const exchangeConfig = getExchangeConfig(company.targetExchange)

  if (!profile || !exchangeConfig) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-yellow-900 mb-2">Exchange Not Selected</h2>
            <p className="text-yellow-800">Please select your target exchange in company settings to view True Cost projections.</p>
          </div>
        </div>
      </div>
    )
  }

  const currentYear1Cost = yearForecasts[0]?.total || 0
  const year3Cost = yearForecasts[2]?.total || 0
  const year5Cost = yearForecasts[3]?.total || 0

  // Calculate trend
  const costTrend = year5Cost > year3Cost ? 'up' : year5Cost < year3Cost ? 'down' : 'stable'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8" style={{ color: '#E8312A' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
            True Cost of Going Public
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          Financial forecast for post-IPO operational costs and compliance
        </p>
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: '#FFF5F4', borderLeft: '4px solid #E8312A' }}>
          <Info className="w-5 h-5" style={{ color: '#E8312A' }} />
          <div>
            <p className="font-semibold text-gray-900">
              Exchange: <span style={{ color: '#E8312A' }}>{profile.exchangeName}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <OverviewCard
          label="Year 1 Annual Cost"
          value={formatCurrency(currentYear1Cost, company.currency)}
          currency={company.currency}
          description="First year operational costs (partial year)"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <OverviewCard
          label="Year 3 Annualized"
          value={formatCurrency(year3Cost, company.currency)}
          currency={company.currency}
          description="Stable run-rate by Year 3"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <OverviewCard
          label="5-Year Average"
          value={formatCurrency((year3Cost + year5Cost) / 2, company.currency)}
          currency={company.currency}
          description="Average annual cost outlook"
          trend={costTrend}
          icon={<FileText className="w-6 h-6" />}
        />
      </motion.div>

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-6">Customize Projections</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Auditor Complexity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Auditor Cost Level
            </label>
            <div className="space-y-2">
              {(['simple', 'medium', 'complex'] as const).map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="auditorComplexity"
                    value={level}
                    checked={auditorComplexity === level}
                    onChange={(e) => setAuditorComplexity(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {level === 'simple' ? 'Simple ($150K–$250K)' : level === 'medium' ? 'Medium ($200K–$350K)' : 'Complex ($350K–$500K)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* IR/PR Budget Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Investor Base Size
            </label>
            <div className="space-y-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="irBudgetSize"
                    value={size}
                    checked={irBudgetSize === size}
                    onChange={(e) => setIrBudgetSize(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {size === 'small' ? 'Small ($100K–$150K)' : size === 'medium' ? 'Medium ($150K–$225K)' : 'Large ($225K–$300K)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Discretionary Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Optional Services
            </label>
            <div className="space-y-2">
              {[
                { key: 'irAdditional', label: 'Additional IR Support' },
                { key: 'governanceServices', label: 'Governance Services' },
                { key: 'listingAgent', label: 'Listing Agent Retainer' },
              ].map(option => (
                <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toggles[option.key as keyof typeof toggles]}
                    onChange={(e) => setToggles(prev => ({
                      ...prev,
                      [option.key]: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Yearly Stacked Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Cost Forecast (Years 1, 2, 3, 5)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => formatCurrency(value as number, company.currency)}
                contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
              {profile.components.map(component => (
                <Bar key={component} dataKey={component} stackId="a" fill={getCategoryColor(component)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Progression Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Year 1 Monthly Ramp-Up</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => formatCurrency(value as number, company.currency)}
                contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="fullTotal"
                stroke="#E8312A"
                strokeWidth={2}
                dot={{ fill: '#E8312A', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Cost Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8 overflow-x-auto"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed Cost Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost Category</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Y1 (First Year)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Y2 (Annual)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Y3 (Annual)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Y5 (Annual)</th>
            </tr>
          </thead>
          <tbody>
            {profile.components.map((categoryId, idx) => {
              const component = COST_COMPONENTS[categoryId]
              if (!component) return null

              return (
                <tr key={categoryId} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: getCategoryColor(categoryId) }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{component.name}</p>
                        <p className="text-xs text-gray-500">{component.description}</p>
                      </div>
                    </div>
                  </td>
                  {yearForecasts.map(forecast => (
                    <td key={forecast.year} className="text-right py-3 px-4 text-gray-900 font-medium">
                      {formatCurrency(forecast.breakdown[categoryId] || 0, company.currency)}
                    </td>
                  ))}
                </tr>
              )
            })}

            {/* Discretionary items if enabled */}
            {toggles.irAdditional && (
              <CostRow
                categoryId="ir-additional"
                forecast={yearForecasts}
                currency={company.currency}
              />
            )}
            {toggles.governanceServices && (
              <CostRow
                categoryId="governance-services"
                forecast={yearForecasts}
                currency={company.currency}
              />
            )}
            {toggles.listingAgent && (
              <CostRow
                categoryId="listing-agent"
                forecast={yearForecasts}
                currency={company.currency}
              />
            )}

            {/* Total Row */}
            <tr style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB', fontWeight: 'bold' }}>
              <td className="py-4 px-4 font-bold text-gray-900">TOTAL ANNUAL COST</td>
              {yearForecasts.map(forecast => (
                <td key={forecast.year} className="text-right py-4 px-4 text-gray-900 font-bold text-base">
                  {formatCurrency(forecast.total, company.currency)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </motion.div>

      {/* Education & Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <EducationCard
          title="Why These Costs Exist"
          items={[
            { label: 'External Auditor', desc: 'Required annual audit and quarterly reviews per securities regulations' },
            { label: 'IR/PR Services', desc: 'Mandatory investor communications and earnings call management' },
            { label: 'Legal Compliance', desc: 'Ongoing securities counsel and regulatory consulting' },
            { label: 'D&O Insurance', desc: 'Protection for directors and officers from personal liability' },
          ]}
        />
        <EducationCard
          title="Key Factors That Impact Costs"
          items={[
            { label: 'Company Size', desc: 'Larger market caps face higher audit and insurance costs' },
            { label: 'Industry Risk', desc: 'Regulated industries (fintech, healthcare) incur premium costs' },
            { label: 'Investor Base', desc: 'More institutional investors require expanded IR services' },
            { label: 'Exchange Tier', desc: 'US exchanges (NYSE, NASDAQ) have higher regulatory costs than Canadian' },
          ]}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex flex-wrap gap-4 justify-center md:justify-start"
      >
        <ActionButton
          icon={<Download className="w-4 h-4" />}
          label="Download as Excel"
          onClick={() => alert('Excel export feature coming soon')}
        />
        <ActionButton
          icon={<FileText className="w-4 h-4" />}
          label="Download as CSV"
          onClick={() => alert('CSV export feature coming soon')}
        />
        <ActionButton
          icon={<Mail className="w-4 h-4" />}
          label="Email to CFO"
          onClick={() => alert('Email feature coming soon')}
          variant="secondary"
        />
      </motion.div>
    </div>
  )
}

interface OverviewCardProps {
  label: string
  value: string
  currency: string
  description: string
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
}

function OverviewCard({ label, value, description, trend, icon }: OverviewCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div style={{ color: '#E8312A' }}>
          {icon}
        </div>
        {trend && (
          <div className="text-xs font-semibold px-2 py-1 rounded" style={{
            background: trend === 'up' ? '#FEE2E2' : trend === 'down' ? '#DBEAFE' : '#FEF3C7',
            color: trend === 'up' ? '#DC2626' : trend === 'down' ? '#2563EB' : '#B45309',
          }}>
            {trend === 'up' ? '↑ Increasing' : trend === 'down' ? '↓ Decreasing' : '→ Stable'}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

interface CostRowProps {
  categoryId: CostCategory
  forecast: YearForecast[]
  currency: string
}

function CostRow({ categoryId, forecast, currency }: CostRowProps) {
  const component = COST_COMPONENTS[categoryId]
  if (!component) return null

  return (
    <tr style={{ borderBottom: '1px solid #F3F4F6', opacity: 0.7 }}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: getCategoryColor(categoryId) }}
          />
          <div>
            <p className="font-medium text-gray-900 italic">{component.name}</p>
            <p className="text-xs text-gray-500">(Optional) {component.description}</p>
          </div>
        </div>
      </td>
      {forecast.map(f => (
        <td key={f.year} className="text-right py-3 px-4 text-gray-900 font-medium">
          {formatCurrency(f.breakdown[categoryId] || 0, currency)}
        </td>
      ))}
    </tr>
  )
}

interface EducationCardProps {
  title: string
  items: Array<{ label: string; desc: string }>
}

function EducationCard({ title, items }: EducationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: '#E8312A' }}
            >
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

function ActionButton({ icon, label, onClick, variant = 'primary' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
        variant === 'primary'
          ? 'text-white shadow-md hover:shadow-lg'
          : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
      style={variant === 'primary' ? { background: '#E8312A' } : {}}
    >
      {icon}
      {label}
    </button>
  )
}
