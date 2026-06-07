'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function PostIPOComplianceModule() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <PremiumPageLayout
      title="Post-IPO Compliance Module"
      subtitle="Automated compliance for 12+ months post-listing (quiet period, reporting, filings)"
      icon={<CheckCircle2 className="w-8 h-8 text-purple-600" />}
    >
      <div className="space-y-5">
      {/* Compliance Timeline (Locked) */}
      <PremiumLock
        featureKey="post_ipo_compliance"
        featureName="Post-IPO Compliance Module"
        badge="red"
        badgeText="Enterprise"
        className="h-80"
      >
        <div className="space-y-2">
          {[
            { milestone: 'Quiet Period Ends', daysOut: 25, icon: Clock },
            { milestone: '10-Q Filing', daysOut: 45, icon: AlertCircle },
            { milestone: 'Analyst Call', daysOut: 50, icon: TrendingUp },
            { milestone: 'First Insider Trading Window', daysOut: 90, icon: CheckCircle2 },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-4 p-3 card">
                <Icon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-nav text-sm font-semibold">{item.milestone}</p>
                  <p className="text-text-muted text-xs mt-0.5">Day {item.daysOut}</p>
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
        className="grid md:grid-cols-3 gap-5"
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
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-purple-600 mb-3" />
              <p className="text-nav text-sm font-semibold">{feature.title}</p>
              <p className="text-text-muted text-xs mt-1">{feature.description}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Compliance Coverage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-5"
      >
        {[
          { coverage: 'Sarbanes-Oxley', items: '8 compliance areas' },
          { coverage: 'Listing Standards', items: '40+ NYSE/NASDAQ rules' },
          { coverage: 'SEC Rules', items: 'Reg FD, Reg S-K, Reg S-X' },
        ].map((item, i) => (
          <div key={i} className="card p-6 border-2 border-purple-200" style={{ background: 'linear-gradient(to bottom right, rgb(250 240 250), rgb(252 231 243))' }}>
            <div className="font-bold text-purple-600 mb-1">{item.coverage}</div>
            <p className="text-text-muted text-sm">{item.items}</p>
          </div>
        ))}
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-8 text-center border-2 border-purple-200"
        style={{ background: 'linear-gradient(to right, rgb(250 240 250), rgb(252 231 243))' }}
      >
        <CheckCircle2 className="w-10 h-10 text-purple-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">Stay Compliant After Listing</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          Post-IPO compliance is complex: quiet period, SEC filings, Sarbanes-Oxley, insider trading windows.
          Automate it all. Avoid $50K+ in legal fees and regulatory violations.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          Upgrade to Enterprise
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
    </PremiumPageLayout>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="post_ipo_compliance"
        featureName="Post-IPO Compliance Module"
      />
    </>
  )
}
