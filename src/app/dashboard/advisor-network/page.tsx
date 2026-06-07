'use client'

import { motion } from 'framer-motion'
import { Users, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function AdvisorOrchestrationNetwork() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
      title="Advisor Orchestration Network"
      subtitle="Coordinate 15-30 advisors with dependency tracking and automated escalation"
      icon={<Users className="w-8 h-8 text-red-600" />}
    >
      <div className="space-y-5">
      {/* Advisor Network (Locked) */}
      <PremiumLock
        featureKey="advisor_network"
        featureName="Advisor Orchestration Network"
        badge="red"
        badgeText="Enterprise"
        className="h-80"
      >
        <div className="grid md:grid-cols-3 gap-3 h-full">
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
              className="card p-4 flex flex-col"
            >
              <p className="text-text-muted text-xs uppercase font-semibold tracking-wider mb-2">{advisor.role}</p>
              <p className="text-nav text-sm font-semibold mb-3">{advisor.name}</p>
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
        className="grid md:grid-cols-3 gap-5"
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
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-red-600 mb-3" />
              <p className="text-nav text-sm font-semibold">{feature.title}</p>
              <p className="text-text-muted text-xs mt-1">{feature.description}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Impact Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-5"
      >
        {[
          { stat: '40%', label: 'Timeline Compression' },
          { stat: '$500K', label: 'Advisor Efficiency Gain' },
          { stat: '15-30', label: 'Advisors Coordinated' },
        ].map((item, i) => (
          <div key={i} className="card p-6 border-2 border-red-200" style={{ background: 'linear-gradient(to bottom right, rgb(254 240 240), rgb(252 231 243))' }}>
            <div className="text-3xl font-bold text-red-600 mb-1">{item.stat}</div>
            <p className="text-text-muted text-sm">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-8 text-center border-2 border-red-200"
        style={{ background: 'linear-gradient(to right, rgb(254 240 240), rgb(252 231 243))' }}
      >
        <Users className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">Compress Your IPO Timeline</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          The Advisor Orchestration Network coordinates all your advisors in one place,
          eliminating miscommunication and reducing IPO timeline by 40%. Save $500K+ in advisor costs.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
        >
          <Users className="w-4 h-4" />
          Upgrade to Enterprise
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
      </PremiumPageLayout>

    <UpgradeModal
      isOpen={showUpgrade}
      onClose={() => setShowUpgrade(false)}
      featureKey="advisor_network"
      featureName="Advisor Orchestration Network"
    />
    </>
  )
}
