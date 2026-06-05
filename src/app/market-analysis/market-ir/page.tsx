'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/app/components/Header'
import {
  CheckCircle2, Copy, Download, Mail, AlertCircle, ChevronDown, ChevronUp,
  TrendingUp, Zap, Users, Target, Calendar, DollarSign, BarChart3, Sparkles,
  Phone, ArrowRight
} from 'lucide-react'

// Types
interface Service {
  id: string
  name: string
  description: string
  coverageItems: string[]
  importance: string
  priceLow: number
  priceExpected: number
  priceAggressive: number
  category: string
}

interface Scenario {
  id: string
  name: string
  description: string
  selectedServices: string[]
  expectedTotal: number
  badge: string
}

const SERVICES: Service[] = [
  {
    id: 'ir-agency',
    name: 'Investor Relations Agency',
    category: 'Communications',
    description: 'Professional investor relations management and communications',
    priceLow: 36000,
    priceExpected: 120000,
    priceAggressive: 180000,
    coverageItems: [
      'Quarterly earnings communication',
      'Investor relations strategy',
      'Conference participation',
      'Analyst briefings',
      'Crisis communications'
    ],
    importance: 'Professional IR is non-negotiable post-IPO'
  },
  {
    id: 'market-maker',
    name: 'Market Maker',
    category: 'Market Support',
    description: 'Stock price support and liquidity management',
    priceLow: 30000,
    priceExpected: 90000,
    priceAggressive: 120000,
    coverageItems: [
      'Stock price support',
      'Liquidity management',
      'Trading activity optimization',
      'Market stability',
      'Volume support'
    ],
    importance: 'Ensures healthy trading volume and stock price stability'
  },
  {
    id: 'newswire',
    name: 'Newswire Service',
    category: 'Distribution',
    description: 'Press release distribution and news syndication',
    priceLow: 2000,
    priceExpected: 8000,
    priceAggressive: 20000,
    coverageItems: [
      'Press release distribution',
      'News syndication',
      'Reach amplification',
      'SEO optimization',
      'Multi-channel distribution'
    ],
    importance: 'Ensures market hears your announcements'
  },
  {
    id: 'ir-website',
    name: 'IR Website',
    category: 'Technology',
    description: 'Investor relations website and document hosting',
    priceLow: 2000,
    priceExpected: 10000,
    priceAggressive: 25000,
    coverageItems: [
      'Investor relations website',
      'Document hosting',
      'SEC filing integration',
      'Analytics and tracking',
      'Quarterly updates'
    ],
    importance: 'Central hub for investor information and SEC documents'
  },
  {
    id: 'investor-crm',
    name: 'Investor CRM Platform',
    category: 'Technology',
    description: 'Investor relationship management and tracking',
    priceLow: 1000,
    priceExpected: 5000,
    priceAggressive: 10000,
    coverageItems: [
      'Investor database',
      'Relationship tracking',
      'Meeting scheduling',
      'Sentiment tracking',
      'Communication history'
    ],
    importance: 'Track investor sentiment and manage relationships at scale'
  },
  {
    id: 'conferences',
    name: 'Investor Conferences',
    category: 'Events',
    description: 'Conference participation and investor meetings',
    priceLow: 10000,
    priceExpected: 40000,
    priceAggressive: 100000,
    coverageItems: [
      'Conference registrations',
      'Travel and logistics',
      'Booth setup',
      'One-on-one meetings',
      'Event preparation'
    ],
    importance: 'Essential for reaching institutional investors'
  },
  {
    id: 'analyst-outreach',
    name: 'Analyst Outreach Program',
    category: 'Relations',
    description: 'Analyst relations and research coverage management',
    priceLow: 10000,
    priceExpected: 25000,
    priceAggressive: 50000,
    coverageItems: [
      'Analyst relations consulting',
      'Earnings call management',
      'Research coverage building',
      'Analyst briefing prep',
      'Coverage tracking'
    ],
    importance: 'Build analyst coverage and credibility in your sector'
  },
  {
    id: 'shareholder-comms',
    name: 'Shareholder Communications',
    category: 'Compliance',
    description: 'Annual reports and shareholder engagement',
    priceLow: 5000,
    priceExpected: 12000,
    priceAggressive: 30000,
    coverageItems: [
      'Annual reports',
      'Proxy materials',
      'Shareholder meetings',
      'Voting materials',
      'Legal compliance'
    ],
    importance: 'Legal requirement and essential shareholder engagement'
  }
]

const SCENARIOS: Scenario[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Minimum Viable Post-IPO',
    selectedServices: ['ir-agency', 'ir-website', 'investor-crm'],
    expectedTotal: 135000,
    badge: 'For companies with limited budget'
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Recommended for Most Companies',
    selectedServices: ['ir-agency', 'market-maker', 'newswire', 'ir-website', 'investor-crm', 'analyst-outreach'],
    expectedTotal: 248000,
    badge: 'Balanced approach, professional coverage'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Aggressive Growth Strategy',
    selectedServices: ['ir-agency', 'market-maker', 'newswire', 'ir-website', 'investor-crm', 'conferences', 'analyst-outreach', 'shareholder-comms'],
    expectedTotal: 450000,
    badge: 'Maximum market support and institutional reach'
  }
]

export default function MarketIRPage() {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  // Calculate budgets
  const budgets = useMemo(() => {
    let low = 0, expected = 0, aggressive = 0
    selectedServices.forEach(serviceId => {
      const service = SERVICES.find(s => s.id === serviceId)
      if (service) {
        low += service.priceLow
        expected += service.priceExpected
        aggressive += service.priceAggressive
      }
    })
    return { low, expected, aggressive }
  }, [selectedServices])

  const selectedServicesList = useMemo(() => {
    return Array.from(selectedServices)
      .map(id => SERVICES.find(s => s.id === id))
      .filter(Boolean) as Service[]
  }, [selectedServices])

  // Budget breakdown by category
  const budgetByCategory = useMemo(() => {
    const categories: Record<string, number> = {}
    selectedServicesList.forEach(service => {
      categories[service.category] = (categories[service.category] || 0) + service.priceExpected
    })
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: budgets.expected > 0 ? (amount / budgets.expected * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [selectedServicesList, budgets])

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  const applyScenario = (scenario: Scenario) => {
    setSelectedServices(new Set(scenario.selectedServices))
  }

  const copyBudgetSummary = () => {
    const summary = `Post-IPO Capital Markets Budget
Expected Annual Budget: $${budgets.expected.toLocaleString()}
Monthly Average: $${(budgets.expected / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}

Selected Services:
${selectedServicesList.map(s => `• ${s.name}: $${s.priceExpected.toLocaleString()}`).join('\n')}

Low Estimate: $${budgets.low.toLocaleString()}
Aggressive Estimate: $${budgets.aggressive.toLocaleString()}`

    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-market-ir-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedServices: selectedServicesList,
          budgets,
          timestamp: new Date().toISOString()
        })
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Market-IR-Budget-Summary-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      <Header />

      {/* Hero Section */}
      <section className="py-16 border-b" style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Post-IPO Capital Markets Budget Planner
            </h1>
            <p className="text-xl mb-6" style={{ color: '#717171' }}>
              Understand the real cost of investor relations, market support, and ongoing capital markets management
            </p>
            <div className="inline-block px-6 py-3 rounded-xl" style={{ background: '#FDECEB' }}>
              <p style={{ color: '#B91C1C' }} className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Most IPO companies underbudget for market support by 40-60%
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Services Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Essential Capital Markets Services
            </h2>
            <p className="mb-8" style={{ color: '#717171' }}>
              Select the services your company needs. Prices reflect typical market rates for post-IPO companies.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {SERVICES.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-6 border-2 transition-all cursor-pointer"
                  style={{
                    background: selectedServices.has(service.id) ? '#FFFBEB' : '#FFFFFF',
                    borderColor: selectedServices.has(service.id) ? '#E8312A' : '#E5E4E0'
                  }}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <input
                      type="checkbox"
                      checked={selectedServices.has(service.id)}
                      onChange={() => toggleService(service.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 mt-1 rounded accent-red-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                        {service.name}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: '#717171' }}>
                        {service.description}
                      </p>
                      <div className="flex gap-3 text-sm mb-3">
                        <span style={{ color: '#717171' }} className="px-2 py-1 rounded bg-gray-100">
                          Low: ${(service.priceLow / 1000).toFixed(0)}K
                        </span>
                        <span style={{ color: '#1A1A1A', background: '#FEF3C7' }} className="px-2 py-1 rounded font-semibold">
                          Expected: ${(service.priceExpected / 1000).toFixed(0)}K
                        </span>
                        <span style={{ color: '#B91C1C', background: '#FEE2E2' }} className="px-2 py-1 rounded font-semibold">
                          Aggressive: ${(service.priceAggressive / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedService(expandedService === service.id ? null : service.id)
                    }}
                    className="flex items-center gap-2 text-sm font-semibold w-full"
                    style={{ color: '#E8312A' }}
                  >
                    {expandedService === service.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedService === service.id ? 'Hide Details' : 'View Details'}
                  </button>

                  <AnimatePresence>
                    {expandedService === service.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E4E0' }}
                      >
                        <p className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>What it covers:</p>
                        <ul className="space-y-2 mb-4">
                          {service.coverageItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#717171' }}>
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#2D7A5F' }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm font-semibold" style={{ color: '#2D7A5F' }}>
                          Why it matters: {service.importance}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Budget Calculator */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-8 border-2" style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
          >
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#1A1A1A' }}>
              Your Budget Summary
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { label: 'Low Estimate', value: budgets.low, color: '#9A9A9A' },
                { label: 'Expected', value: budgets.expected, color: '#B45309' },
                { label: 'Aggressive', value: budgets.aggressive, color: '#E8312A' }
              ].map((item) => (
                <div key={item.label} className="rounded-xl p-6" style={{ background: '#F7F6F4' }}>
                  <p className="text-sm mb-2" style={{ color: '#717171' }}>
                    {item.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: item.color }}>
                    ${(item.value / 1000).toFixed(0)}K
                  </p>
                  <div className="mt-4 h-2 rounded-full" style={{ background: '#E5E4E0' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        background: item.color,
                        width: budgets.aggressive > 0 ? `${(item.value / budgets.aggressive * 100).toFixed(0)}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedServicesList.length > 0 && (
              <>
                <div className="border-t mb-8" style={{ borderColor: '#E5E4E0' }} />

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                      Your Selections
                    </h3>
                    <div className="space-y-2">
                      {selectedServicesList.map(service => (
                        <div key={service.id} className="flex justify-between items-center text-sm p-2 rounded" style={{ background: '#F7F6F4' }}>
                          <span style={{ color: '#1A1A1A' }}>{service.name}</span>
                          <span style={{ color: '#717171' }}>
                            ${(service.priceExpected / 1000).toFixed(0)}K
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                      Budget Breakdown by Category
                    </h3>
                    <div className="space-y-2">
                      {budgetByCategory.map((item) => (
                        <div key={item.category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: '#1A1A1A' }}>{item.category}</span>
                            <span style={{ color: '#717171' }}>{item.percentage}%</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: '#E5E4E0' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                background: '#E8312A',
                                width: `${item.percentage}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t grid md:grid-cols-2 gap-6" style={{ borderColor: '#E5E4E0' }}>
                  <div className="rounded-xl p-6" style={{ background: '#F7F6F4' }}>
                    <p className="text-sm mb-2" style={{ color: '#717171' }}>
                      Total Expected Annual Budget
                    </p>
                    <p className="text-4xl font-bold mb-3" style={{ color: '#E8312A' }}>
                      ${budgets.expected.toLocaleString()}
                    </p>
                    <p style={{ color: '#717171' }}>
                      Monthly Average: ${(budgets.expected / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyBudgetSummary}
                      className="flex-1 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background: '#F7F6F4', color: '#1A1A1A', border: '1px solid #E5E4E0' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F0EFED'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#F7F6F4'}
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy Summary'}
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="flex-1 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background: '#E8312A', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#C4261F'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#E8312A'}
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </>
            )}

            {selectedServicesList.length === 0 && (
              <div className="text-center py-8" style={{ color: '#717171' }}>
                <p>Select services above to see your budget summary</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Scenarios */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Quick-Start Scenarios
            </h2>
            <p className="mb-8" style={{ color: '#717171' }}>
              Click any scenario to auto-fill your selections
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {SCENARIOS.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  whileHover={{ y: -4 }}
                  onClick={() => applyScenario(scenario)}
                  className="rounded-2xl p-6 border-2 cursor-pointer transition-all"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#E5E4E0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E8312A'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(232, 49, 42, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E4E0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    {scenario.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#717171' }}>
                    {scenario.description}
                  </p>
                  <p className="text-3xl font-bold mb-4" style={{ color: '#E8312A' }}>
                    ${(scenario.expectedTotal / 1000).toFixed(0)}K/yr
                  </p>
                  <p className="text-xs px-3 py-2 rounded-full mb-4 inline-block" style={{ background: '#F7F6F4', color: '#717171' }}>
                    {scenario.badge}
                  </p>
                  <p className="text-xs font-semibold mb-4" style={{ color: '#717171' }}>
                    {scenario.selectedServices.length} services included
                  </p>
                  <button
                    className="w-full rounded-lg py-2 font-semibold transition-all"
                    style={{
                      background: '#1A1A1A',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2A2A2A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1A1A1A'}
                  >
                    Use This Scenario
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#1A1A1A' }}>
              Post-IPO Timeline
            </h2>

            <div className="space-y-8">
              {[
                {
                  phase: 'Month 1-2',
                  title: 'Listing',
                  items: [
                    'Market Maker: Active (stabilize stock)',
                    'IR Agency: Begins analyst calls',
                    'Newswire: Announces milestones'
                  ]
                },
                {
                  phase: 'Month 3-6',
                  title: 'Earnings Season',
                  items: [
                    'IR Agency: Quarterly earnings calls',
                    'Analyst Outreach: Push for coverage',
                    'Conferences: Investor meetings',
                    'Investor CRM: Track sentiment'
                  ]
                },
                {
                  phase: 'Month 6-12',
                  title: 'Ongoing Operations',
                  items: [
                    'All services in steady state',
                    'Analyst relations: Growth coverage',
                    'Shareholder comms: Annual report',
                    'Conferences: Multiple events'
                  ]
                },
                {
                  phase: 'Year 2+',
                  title: 'Optimization',
                  items: [
                    'Reduce/optimize based on results',
                    'Market maker: May reduce if stable',
                    'IR agency: May adjust based on needs'
                  ]
                }
              ].map((phase) => (
                <div key={phase.phase} className="rounded-2xl p-6 border" style={{ borderColor: '#E5E4E0', background: '#FFFFFF' }}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-3 flex-shrink-0" style={{ background: '#F7F6F4' }}>
                      <Calendar className="w-5 h-5" style={{ color: '#E8312A' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#E8312A' }}>
                        {phase.phase}
                      </p>
                      <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                        {phase.title}
                      </h3>
                      <ul className="space-y-2">
                        {phase.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: '#717171' }}>
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Vendor Marketplace */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-8 border-2" style={{ background: '#FFFFFF', borderColor: '#E5E4E0' }}
          >
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Need Assistance?
            </h2>
            <p className="mb-8 text-lg" style={{ color: '#717171' }}>
              IPOReady can facilitate introductions with qualified providers in each category. We connect you with vetted professionals who understand the IPO space and post-listing requirements. <span className="font-semibold">These are introductions only — you retain complete independence in vendor selection.</span>
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Services We Can Introduce
                </h3>
                <div className="space-y-3">
                  {[
                    'Investor Relations Agencies',
                    'Market Makers / Market Support',
                    'Transfer Agents',
                    'Securities Counsel',
                    'Auditors',
                    'Capital Markets Advisors',
                    'Investor Conference Organizers'
                  ].map((service) => (
                    <div key={service} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#2D7A5F' }} />
                      <span style={{ color: '#1A1A1A' }}>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-6 border-2" style={{ background: '#F7F6F4', borderColor: '#E5E4E0' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Ready for Introductions?
                </h3>
                <p className="mb-6" style={{ color: '#717171' }}>
                  Contact our market advisory team:
                </p>
                <a
                  href="mailto:market@ipoready.com"
                  className="block mb-6 text-center rounded-xl py-3 font-semibold transition-all"
                  style={{ background: '#E8312A', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#C4261F'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#E8312A'}
                >
                  market@ipoready.com
                </a>
                <div className="space-y-3 text-sm" style={{ color: '#717171' }}>
                  <p><span className="font-semibold">Tell us:</span></p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Which services you need</li>
                    <li>Your budget range</li>
                    <li>Your timeline</li>
                  </ul>
                  <p className="mt-4"><span className="font-semibold">We'll introduce you to 2-3 qualified providers</span> who specialize in post-IPO companies.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#1A1A1A' }}>
              Common Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'When should we start engaging IR services?',
                  a: 'You should begin engaging an IR agency 6 months before your anticipated listing date. Market support and initial analyst outreach take time to establish credibility.'
                },
                {
                  q: 'Can we reduce IR spending after year 1?',
                  a: 'Yes. After stabilization, many companies reduce market maker engagement or optimize IR agency costs based on coverage achieved. Year 1 is typically the most intensive.'
                },
                {
                  q: 'Are these prices inclusive of all costs?',
                  a: 'Prices shown reflect typical annual retainers. Some services (conferences, travel) may have additional out-of-pocket costs depending on your participation level.'
                },
                {
                  q: 'Can we start small and expand?',
                  a: 'Absolutely. Most companies begin with the Essential scenario and add services as their budget permits. We recommend starting with IR Agency + IR Website + CRM.'
                },
                {
                  q: 'How do we know which providers to choose?',
                  a: 'IPOReady can introduce you to 2-3 qualified providers in each category. We vet based on IPO experience, your sector, and exchange requirements.'
                }
              ].map((faq, idx) => (
                <FAQItem key={idx} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="rounded-xl border-2 overflow-hidden transition-all"
      style={{
        background: '#FFFFFF',
        borderColor: open ? '#E8312A' : '#E5E4E0'
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all"
      >
        <span className="text-left font-semibold" style={{ color: '#1A1A1A' }}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: '#E8312A' }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t px-6 py-4" style={{ borderColor: '#E5E4E0' }}
          >
            <p style={{ color: '#717171' }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
