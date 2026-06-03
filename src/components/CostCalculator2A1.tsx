'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle,
  Download,
  Save,
} from 'lucide-react'

// Type definitions
interface CostItem {
  id: string
  name: string
  category: 'capex' | 'opex'
  subcategory: string
  amount: number
  timeline: 'pre-ipo' | 'pre-launch' | 'post-launch'
  notes: string
}

interface TimelinePhase {
  phase: 'Pre-IPO' | 'Pre-Launch' | 'Post-Launch'
  preIpo: number
  preLaunch: number
  postLaunch: number
}

interface CategoryTotal {
  name: string
  value: number
  percentage: number
}

// Sample data for $50M+ IPO
const SAMPLE_COSTS: CostItem[] = [
  // CAPEX - Equipment
  {
    id: '1',
    name: 'Trading Systems Infrastructure',
    category: 'capex',
    subcategory: 'Equipment',
    amount: 2500000,
    timeline: 'pre-ipo',
    notes: 'Servers, networking, failover systems',
  },
  {
    id: '2',
    name: 'Regulatory Compliance Systems',
    category: 'capex',
    subcategory: 'Equipment',
    amount: 1800000,
    timeline: 'pre-ipo',
    notes: 'Market surveillance, audit trails',
  },
  {
    id: '3',
    name: 'Office Build-out',
    category: 'capex',
    subcategory: 'Build-out',
    amount: 3200000,
    timeline: 'pre-launch',
    notes: 'HQ renovation, branch offices',
  },
  {
    id: '4',
    name: 'Technology Stack Licensing',
    category: 'capex',
    subcategory: 'Equipment',
    amount: 950000,
    timeline: 'pre-ipo',
    notes: 'Multi-year licenses, enterprise software',
  },

  // CAPEX - Legal
  {
    id: '5',
    name: 'Legal Documentation',
    category: 'capex',
    subcategory: 'Legal',
    amount: 2800000,
    timeline: 'pre-ipo',
    notes: 'S-1 filing, prospectus, agreements',
  },
  {
    id: '6',
    name: 'Regulatory Filings',
    category: 'capex',
    subcategory: 'Legal',
    amount: 1200000,
    timeline: 'pre-ipo',
    notes: 'SEC, stock exchange, state filings',
  },
  {
    id: '7',
    name: 'Insurance & Indemnification',
    category: 'capex',
    subcategory: 'Legal',
    amount: 4500000,
    timeline: 'pre-launch',
    notes: 'D&O, E&O, excess liability',
  },

  // OPEX - Personnel (salaries during IPO prep)
  {
    id: '8',
    name: 'CFO & Finance Team',
    category: 'opex',
    subcategory: 'Personnel',
    amount: 3600000,
    timeline: 'pre-ipo',
    notes: '12-month dedicated prep',
  },
  {
    id: '9',
    name: 'Investor Relations Team',
    category: 'opex',
    subcategory: 'Personnel',
    amount: 2400000,
    timeline: 'pre-ipo',
    notes: '12-month IR preparation',
  },
  {
    id: '10',
    name: 'Compliance Officers',
    category: 'opex',
    subcategory: 'Personnel',
    amount: 1800000,
    timeline: 'pre-ipo',
    notes: '12-month regulatory oversight',
  },
  {
    id: '11',
    name: 'Operations Team Expansion',
    category: 'opex',
    subcategory: 'Personnel',
    amount: 2200000,
    timeline: 'pre-launch',
    notes: '6-month hiring & training',
  },

  // OPEX - Services
  {
    id: '12',
    name: 'Lead Underwriter Fees',
    category: 'opex',
    subcategory: 'Services',
    amount: 8500000,
    timeline: 'pre-ipo',
    notes: '3-4% of IPO proceeds',
  },
  {
    id: '13',
    name: 'Auditing Services',
    category: 'opex',
    subcategory: 'Services',
    amount: 2200000,
    timeline: 'pre-ipo',
    notes: 'Big 4 audit, SOX compliance',
  },
  {
    id: '14',
    name: 'Printing & Distribution',
    category: 'opex',
    subcategory: 'Services',
    amount: 1500000,
    timeline: 'pre-launch',
    notes: 'Prospectuses, marketing materials',
  },
  {
    id: '15',
    name: 'Road Show Costs',
    category: 'opex',
    subcategory: 'Services',
    amount: 2800000,
    timeline: 'pre-ipo',
    notes: 'Travel, logistics, presentations',
  },

  // OPEX - Marketing
  {
    id: '16',
    name: 'Brand Positioning Campaign',
    category: 'opex',
    subcategory: 'Marketing',
    amount: 3200000,
    timeline: 'pre-launch',
    notes: 'Media, digital, PR agencies',
  },
  {
    id: '17',
    name: 'Investor Marketing Materials',
    category: 'opex',
    subcategory: 'Marketing',
    amount: 1800000,
    timeline: 'pre-ipo',
    notes: 'Pitch decks, case studies, videos',
  },

  // OPEX - Regulatory
  {
    id: '18',
    name: 'Regulatory Consulting',
    category: 'opex',
    subcategory: 'Regulatory',
    amount: 2100000,
    timeline: 'pre-ipo',
    notes: 'SEC compliance advisors',
  },
  {
    id: '19',
    name: 'Continuing Education & Training',
    category: 'opex',
    subcategory: 'Regulatory',
    amount: 950000,
    timeline: 'pre-launch',
    notes: 'Board/staff compliance training',
  },
  {
    id: '20',
    name: 'External Audit Committees',
    category: 'opex',
    subcategory: 'Regulatory',
    amount: 1400000,
    timeline: 'post-launch',
    notes: '24-month post-launch support',
  },
]

const CAPEX_SUBCATEGORIES = ['Equipment', 'Build-out', 'Legal']
const OPEX_SUBCATEGORIES = ['Personnel', 'Services', 'Marketing', 'Regulatory']

const COLORS_PALETTE = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function CostCalculator2A1() {
  const [costs, setCosts] = useState<CostItem[]>(SAMPLE_COSTS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'capex' as const,
    subcategory: 'Equipment',
    amount: 0,
    timeline: 'pre-ipo' as const,
    notes: '',
  })

  // Calculate totals
  const capexTotal = costs
    .filter((c) => c.category === 'capex')
    .reduce((sum, c) => sum + c.amount, 0)
  const opexTotal = costs
    .filter((c) => c.category === 'opex')
    .reduce((sum, c) => sum + c.amount, 0)
  const grandTotal = capexTotal + opexTotal

  // Timeline breakdown
  const timelineData = [
    {
      phase: 'Pre-IPO',
      preIpo: costs
        .filter((c) => c.timeline === 'pre-ipo')
        .reduce((sum, c) => sum + c.amount, 0),
      preLaunch: 0,
      postLaunch: 0,
    },
    {
      phase: 'Pre-Launch',
      preIpo: 0,
      preLaunch: costs
        .filter((c) => c.timeline === 'pre-launch')
        .reduce((sum, c) => sum + c.amount, 0),
      postLaunch: 0,
    },
    {
      phase: 'Post-Launch',
      preIpo: 0,
      preLaunch: 0,
      postLaunch: costs
        .filter((c) => c.timeline === 'post-launch')
        .reduce((sum, c) => sum + c.amount, 0),
    },
  ]

  // Category breakdown for pie chart
  const categoryBreakdown = (() => {
    const breakdown: { [key: string]: number } = {}
    costs.forEach((cost) => {
      const key = `${cost.category.toUpperCase()} - ${cost.subcategory}`
      breakdown[key] = (breakdown[key] || 0) + cost.amount
    })
    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / grandTotal) * 100).toFixed(1),
    }))
  })()

  // Monthly cost progression (simplified)
  const monthlyProgression = Array.from({ length: 12 }, (_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const cumulative = grandTotal * ((i + 1) / 12)
    return {
      month: months[i],
      cumulative: Math.round(cumulative),
      monthly: Math.round(grandTotal / 12),
    }
  })

  const handleAddCost = () => {
    if (!formData.name || formData.amount <= 0) {
      alert('Please fill in all fields')
      return
    }

    const newCost: CostItem = {
      id: Date.now().toString(),
      ...formData,
    }

    setCosts([...costs, newCost])
    setFormData({
      name: '',
      category: 'capex',
      subcategory: 'Equipment',
      amount: 0,
      timeline: 'pre-ipo',
      notes: '',
    })
    setShowAddForm(false)
  }

  const handleDeleteCost = (id: string) => {
    setCosts(costs.filter((c) => c.id !== id))
  }

  const handleExport = () => {
    const csv = [
      ['Cost Item', 'Category', 'Subcategory', 'Amount', 'Timeline', 'Notes'],
      ...costs.map((c) => [c.name, c.category, c.subcategory, c.amount, c.timeline, c.notes]),
      [],
      ['CAPEX Total', '', '', capexTotal],
      ['OPEX Total', '', '', opexTotal],
      ['GRAND TOTAL', '', '', grandTotal],
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ipo-cost-calculator-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const subcategories = formData.category === 'capex' ? CAPEX_SUBCATEGORIES : OPEX_SUBCATEGORIES

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">IPO Cost Calculator</h1>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Interactive cost tracker for $50M+ IPO with capex, opex, and timeline visualization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">CAPEX Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${(capexTotal / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {((capexTotal / grandTotal) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">OPEX Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${(opexTotal / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {((opexTotal / grandTotal) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Grand Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${(grandTotal / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {costs.length} line items
          </p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Cost Timeline
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="phase" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                formatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
              <Bar dataKey="preIpo" fill="#3b82f6" name="Pre-IPO" />
              <Bar dataKey="preLaunch" fill="#8b5cf6" name="Pre-Launch" />
              <Bar dataKey="postLaunch" fill="#10b981" name="Post-Launch" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Cost Breakdown by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Cost Over Time */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Cumulative Cost Projection
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyProgression}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              formatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Cumulative Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryBreakdown.map((cat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS_PALETTE[idx % COLORS_PALETTE.length] }}
                />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{cat.name}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                ${(cat.value / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(cat.value / grandTotal) * 100}%`,
                  backgroundColor: COLORS_PALETTE[idx % COLORS_PALETTE.length],
                }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cat.percentage}% of total</p>
          </div>
        ))}
      </div>

      {/* Add New Cost Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Cost Item</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Cancel' : 'Add New'}
          </button>
        </div>

        {showAddForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Cost name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'capex' | 'opex',
                  subcategory:
                    e.target.value === 'capex' ? 'Equipment' : 'Personnel',
                })
              }
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="capex">CAPEX</option>
              <option value="opex">OPEX</option>
            </select>

            <select
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount ($)"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value as any })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pre-ipo">Pre-IPO</option>
              <option value="pre-launch">Pre-Launch</option>
              <option value="post-launch">Post-Launch</option>
            </select>

            <input
              type="text"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="md:col-span-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleAddCost}
              className="md:col-span-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Add Cost
            </button>
          </div>
        )}
      </div>

      {/* Cost Line Items Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cost Line Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                Cost Name
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                Category
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                Timeline
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                Amount
              </th>
              <th className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => (
              <tr
                key={cost.id}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="font-medium text-slate-900 dark:text-white">{cost.name}</p>
                  {cost.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cost.notes}</p>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {cost.category.toUpperCase()} - {cost.subcategory}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {cost.timeline === 'pre-ipo'
                      ? 'Pre-IPO'
                      : cost.timeline === 'pre-launch'
                        ? 'Pre-Launch'
                        : 'Post-Launch'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                  ${(cost.amount / 1000000).toFixed(2)}M
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleDeleteCost(cost.id)}
                    className="inline-flex items-center justify-center p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Cost Summary & Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              <strong>Average Cost Per Item:</strong> ${(grandTotal / costs.length / 1000000).toFixed(2)}M
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              <strong>Cost as % of Revenue:</strong> Typically 2-5% for companies with $500M+ revenue
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              <strong>Largest Cost Category:</strong>{' '}
              {categoryBreakdown.length > 0 && categoryBreakdown[0].name} (
              {categoryBreakdown.length > 0 && categoryBreakdown[0].percentage}%)
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              <strong>CAPEX/OPEX Ratio:</strong> {(capexTotal / opexTotal).toFixed(2)}:1
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
