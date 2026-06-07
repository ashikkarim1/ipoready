'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function CFOFinancialDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
      title="CFO Financial Dashboard"
      subtitle="Financial modeling, unit economics, runway analysis, and waterfall forecasting"
      icon={<BarChart3 className="w-8 h-8 text-emerald-600" />}
    >
      <div className="space-y-5">
      {/* Financial Dashboard (Locked) */}
      <PremiumLock
        featureKey="cfo_dashboard"
        featureName="CFO Financial Dashboard"
        badge="gold"
        badgeText="Enterprise"
        className="h-80"
      >
        <div className="grid md:grid-cols-2 gap-3 h-full">
          <div className="card p-6">
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-2">Monthly Burn Rate</p>
            <div className="text-3xl font-bold text-nav mb-3">$450K</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Runway</span>
                <span className="font-semibold text-nav">18 months</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-2">Revenue Growth</p>
            <div className="text-3xl font-bold text-nav mb-3">+34% YoY</div>
            <p className="text-text-muted text-xs">
              Projected to reach $2.5M ARR by IPO
            </p>
          </div>
        </div>
      </PremiumLock>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-5"
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
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-emerald-600 mb-3" />
              <p className="text-nav text-sm font-semibold">{feature.title}</p>
              <p className="text-text-muted text-xs mt-1">{feature.description}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-8 text-center border-2 border-emerald-200"
        style={{ background: 'linear-gradient(to right, rgb(240 253 250), rgb(240 253 250))' }}
      >
        <BarChart3 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">Master Your Financial Story</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          Give your CFO real-time financial visibility with modeling, unit economics, and runway tracking.
          Build confidence in your financial projections for IPO conversations.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          Upgrade to Enterprise
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
      </PremiumPageLayout>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="cfo_dashboard"
        featureName="CFO Financial Dashboard"
      />
    </>
  )
}
