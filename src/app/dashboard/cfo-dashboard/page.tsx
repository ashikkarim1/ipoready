'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, Percent, Target, Calendar } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function CFOFinancialDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const financials = [
    { label: 'Gross Margin', value: '72%', target: '75%', trend: '+3%' },
    { label: 'Operating Margin', value: '18%', target: '25%', trend: '+2%' },
    { label: 'Runway', value: '24 months', target: '36+ months', trend: '+4 months' },
    { label: 'Cash Burn Rate', value: '$2.1M/mo', target: '$1.8M/mo', trend: '-8%' },
  ]
  const forecastData = [
    { period: 'Q3 2026', revenue: '$45.2M', opex: '$28.5M', margin: '37%' },
    { period: 'Q4 2026', revenue: '$52.3M', opex: '$30.1M', margin: '42%' },
    { period: 'Q1 2027', revenue: '$61.8M', opex: '$31.5M', margin: '49%' },
  ]

  return (
    <>
      <PremiumPageLayout title="CFO Financial Dashboard" subtitle="Financial modeling, unit economics, and waterfall forecasting" icon={<BarChart3 className="w-8 h-8 text-emerald-600" />}>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Financial Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {financials.map((m, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                  <p className="text-sm text-text-muted mb-2">{m.label}</p>
                  <p className="text-2xl font-bold text-nav mb-2">{m.value}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Target: {m.target}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-nav mb-4">3-Quarter Forecast</h2>
            <div className="space-y-3">
              {forecastData.map((f, i) => (
                <motion.div key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i*0.1}} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-nav text-sm">{f.period}</p>
                      <p className="text-xs text-text-muted mt-1">Revenue: {f.revenue} | OpEx: {f.opex}</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{f.margin}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
            <p className="text-2xl font-bold text-nav mb-2">$127.3M</p>
            <p className="text-sm text-text-muted mb-4">Projected Revenue (Next 12 Months)</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{width: '72%'}}></div>
            </div>
            <p className="text-xs text-text-muted mt-2">72% of IPO target ($175M)</p>
          </div>

          <button onClick={() => setShowUpgrade(true)} className="block mx-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all">View Full Financials</button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} featureKey="cfo_dashboard" featureName="CFO Dashboard" />
    </>
  )
}
