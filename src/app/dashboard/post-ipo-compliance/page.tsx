'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function PostIPOComplianceModule() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
              <h1 className="h1">Post-IPO Compliance Module</h1>
            </div>
            <p className="text-text-muted">
              Automated compliance for 12+ months post-listing (quiet period, reporting, filings)
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Compliance Timeline (Locked) */}
          <PremiumLock
            featureKey="post_ipo_compliance"
            featureName="Post-IPO Compliance Module"
            badge="red"
            badgeText="Enterprise"
            className="h-96"
          >
            <div className="space-y-3">
              {[
                { milestone: 'Quiet Period Ends', daysOut: 25, icon: Clock },
                { milestone: '10-Q Filing', daysOut: 45, icon: AlertCircle },
                { milestone: 'Analyst Call', daysOut: 50, icon: TrendingUp },
                { milestone: 'First Insider Trading Window', daysOut: 90, icon: CheckCircle2 },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
                    <Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-nav">{item.milestone}</div>
                      <div className="text-xs text-text-muted">Day {item.daysOut}</div>
                    </div>
                  </div>
                )
              })}
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
                title: 'Quiet Period Management',
                description: 'Track communication restrictions and auto-generate approved messaging',
                icon: Clock,
              },
              {
                title: 'SEC Reporting',
                description: '10-Q, 10-K, 8-K automation with deadline tracking',
                icon: CheckCircle2,
              },
              {
                title: 'Disclosure Controls',
                description: 'Section 302/906 certification workflows and documentation',
                icon: AlertCircle,
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-nav mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Compliance Coverage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {[
              { coverage: 'Sarbanes-Oxley', items: '8 compliance areas' },
              { coverage: 'Listing Standards', items: '40+ NYSE/NASDAQ rules' },
              { coverage: 'SEC Rules', items: 'Reg FD, Reg S-K, Reg S-X' },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="font-bold text-purple-600 mb-1">{item.coverage}</div>
                <div className="text-sm text-text-muted">{item.items}</div>
              </div>
            ))}
          </motion.div>

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">Stay Compliant After Listing</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              Post-IPO compliance is complex: quiet period, SEC filings, Sarbanes-Oxley, insider trading windows.
              Automate it all. Avoid $50K+ in legal fees and regulatory violations.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              Upgrade to Enterprise
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="post_ipo_compliance"
        featureName="Post-IPO Compliance Module"
      />
    </div>
  )
}
