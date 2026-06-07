'use client'

import { motion } from 'framer-motion'
import { Users, CheckCircle2, FileText, Clock } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function BoardIntelligencePortal() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <PremiumPageLayout
      title="Board Intelligence Portal"
      subtitle="Board materials, governance tracking, and meeting management in one place"
      icon={<Users className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-5">
      {/* Board Materials Section (Locked) */}
      <PremiumLock
        featureKey="board_portal"
        featureName="Board Intelligence Portal"
        badge="gold"
        badgeText="Premium"
        className="h-80"
      >
        <div className="space-y-2">
          {[
            { title: 'Q2 2026 Board Package', date: 'Due in 5 days', status: 'In Progress' },
            { title: 'Financial Statements', date: 'Updated yesterday', status: 'Ready' },
            { title: 'Compliance Updates', date: 'Reviewed', status: 'Complete' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 card"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-nav text-sm font-semibold">{item.title}</p>
                  <p className="text-text-muted text-xs mt-0.5">{item.date}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                {item.status}
              </span>
            </div>
          ))}
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
            title: 'Board Materials',
            description: 'Organize and version all board packages and documents',
            icon: FileText,
          },
          {
            title: 'Meeting Tracking',
            description: 'Schedule, document, and track board meeting actions',
            icon: Clock,
          },
          {
            title: 'Governance',
            description: 'Board composition, independence, and compliance checks',
            icon: CheckCircle2,
          },
        ].map((feature, i) => {
          const Icon = feature.icon
          return (
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-blue-600 mb-3" />
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
        className="card p-8 text-center border-2 border-blue-200"
        style={{ background: 'linear-gradient(to right, rgb(240 249 255), rgb(224 242 254))' }}
      >
        <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">Streamline Board Governance</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          Centralize board materials, governance tracking, and meeting management. Reduce legal
          risk and improve board efficiency with a single source of truth.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
        >
          <Users className="w-4 h-4" />
          Upgrade to Professional
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
    </PremiumPageLayout>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="board_portal"
        featureName="Board Intelligence Portal"
      />
    </>
  )
}
