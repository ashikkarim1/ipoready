'use client'

import { motion } from 'framer-motion'
import { Users, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function AdvisorOrchestrationNetwork() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-red-600" />
              <h1 className="h1">Advisor Orchestration Network</h1>
            </div>
            <p className="text-text-muted">
              Coordinate 15-30 advisors with dependency tracking and automated escalation
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Advisor Network (Locked) */}
          <PremiumLock
            featureKey="advisor_network"
            featureName="Advisor Orchestration Network"
            badge="red"
            badgeText="Enterprise"
            className="h-96"
          >
            <div className="grid md:grid-cols-3 gap-4 h-full">
              {[
                {
                  role: 'Legal Counsel',
                  name: 'Simpson Legal',
                  status: 'On Track',
                  blockers: 0,
                },
                {
                  role: 'Investment Banking',
                  name: 'Goldman Sachs',
                  status: 'At Risk',
                  blockers: 2,
                },
                {
                  role: 'Auditors',
                  name: 'Deloitte',
                  status: 'On Track',
                  blockers: 0,
                },
              ].map((advisor, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-slate-200 flex flex-col"
                >
                  <div className="text-xs text-text-muted mb-2">{advisor.role}</div>
                  <div className="font-semibold text-nav mb-3">{advisor.name}</div>
                  <div className="mt-auto">
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                        advisor.blockers > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {advisor.status}
                    </div>
                    {advisor.blockers > 0 && (
                      <div className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {advisor.blockers} blockers
                      </div>
                    )}
                  </div>
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
                title: 'Dependency Tracking',
                description: 'Map interdependencies between advisors and auto-escalate blockers',
                icon: ArrowRight,
              },
              {
                title: 'Real-Time Collaboration',
                description: 'Unified workspace for all advisors with version control',
                icon: Users,
              },
              {
                title: 'Automated Alerts',
                description: 'Instant notifications when advisors hit milestones or blockers',
                icon: AlertCircle,
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-semibold text-nav mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {[
              { stat: '40%', label: 'Timeline Compression' },
              { stat: '$500K', label: 'Advisor Efficiency Gain' },
              { stat: '15-30', label: 'Advisors Coordinated' },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">{item.stat}</div>
                <div className="text-sm text-text-muted">{item.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-8 text-center"
          >
            <Users className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">Compress Your IPO Timeline</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              The Advisor Orchestration Network coordinates all your advisors in one place,
              eliminating miscommunication and reducing IPO timeline by 40%. Save $500K+ in advisor costs.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
            >
              <Users className="w-5 h-5" />
              Upgrade to Enterprise
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="advisor_network"
        featureName="Advisor Orchestration Network"
      />
    </div>
  )
}
