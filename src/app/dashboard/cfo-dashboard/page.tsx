'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function CFOFinancialDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              <h1 className="h1">CFO Financial Dashboard</h1>
            </div>
            <p className="text-text-muted">
              Financial modeling, unit economics, runway analysis, and waterfall forecasting
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Financial Dashboard (Locked) */}
          <PremiumLock
            featureKey="cfo_dashboard"
            featureName="CFO Financial Dashboard"
            badge="gold"
            badgeText="Enterprise"
            className="h-96"
          >
            <div className="grid md:grid-cols-2 gap-4 h-full">
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <div className="text-sm text-text-muted mb-2">Monthly Burn Rate</div>
                <div className="text-3xl font-bold text-nav mb-3">$450K</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Runway</span>
                    <span className="font-semibold">18 months</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <div className="text-sm text-text-muted mb-2">Revenue Growth</div>
                <div className="text-3xl font-bold text-nav mb-3">+34% YoY</div>
                <div className="text-xs text-text-muted">
                  Projected to reach $2.5M ARR by IPO
                </div>
              </div>
            </div>
          </PremiumLock>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {[
              {
                title: 'Financial Modeling',
                description: '3-statement model with scenario planning and sensitivity analysis',
                icon: TrendingUp,
              },
              {
                title: 'Unit Economics',
                description: 'Track CAC, LTV, payback period, and cohort analysis',
                icon: PieChart,
              },
              {
                title: 'Runway Analysis',
                description: 'Real-time runway tracking with burn rate projections',
                icon: DollarSign,
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-nav mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-8 text-center"
          >
            <BarChart3 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">Master Your Financial Story</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              Give your CFO real-time financial visibility with modeling, unit economics, and runway tracking.
              Build confidence in your financial projections for IPO conversations.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              Upgrade to Enterprise
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="cfo_dashboard"
        featureName="CFO Financial Dashboard"
      />
    </div>
  )
}
