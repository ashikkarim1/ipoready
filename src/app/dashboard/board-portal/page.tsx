'use client'

import { motion } from 'framer-motion'
import { Users, CheckCircle2, FileText, Clock } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function BoardIntelligencePortal() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="h1">Board Intelligence Portal</h1>
            </div>
            <p className="text-text-muted">
              Board materials, governance tracking, and meeting management in one place
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Board Materials Section (Locked) */}
          <PremiumLock
            featureKey="board_portal"
            featureName="Board Intelligence Portal"
            badge="gold"
            badgeText="Premium"
            className="h-96"
          >
            <div className="space-y-3">
              {[
                { title: 'Q2 2026 Board Package', date: 'Due in 5 days', status: 'In Progress' },
                { title: 'Financial Statements', date: 'Updated yesterday', status: 'Ready' },
                { title: 'Compliance Updates', date: 'Reviewed', status: 'Complete' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-nav">{item.title}</div>
                      <div className="text-xs text-text-muted">{item.date}</div>
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
            className="grid md:grid-cols-3 gap-4"
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
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-blue-600 mb-3" />
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
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center"
          >
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">Streamline Board Governance</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              Centralize board materials, governance tracking, and meeting management. Reduce legal
              risk and improve board efficiency with a single source of truth.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
            >
              <Users className="w-5 h-5" />
              Upgrade to Professional
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="board_portal"
        featureName="Board Intelligence Portal"
      />
    </div>
  )
}
