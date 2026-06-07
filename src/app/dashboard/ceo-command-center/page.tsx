'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Crown, AlertCircle, TrendingUp, Users, Calendar, Target } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function CEOCommandCenter() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <React.Fragment>
      <PremiumPageLayout
      title="CEO Command Center"
      subtitle="Real-time executive dashboard with KPIs, risk alerts, and board-ready insights"
      icon={<Crown className="w-8 h-8 text-yellow-600" />}
    >
      <div className="space-y-5">
      {/* Dashboard Grid (Locked) */}
      <PremiumLock
        featureKey="ceo_dashboard"
        featureName="CEO Command Center"
        badge="gold"
        badgeText="Premium"
        className="h-80"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 h-full">
          {[
            { label: 'IPO Readiness', value: '73%', icon: Target },
            { label: 'Days to IPO', value: '247', icon: Calendar },
            { label: 'Active Tasks', value: '12', icon: AlertCircle },
            { label: 'Team Members', value: '8', icon: Users },
          ].map((card, i) => {
            const Icon = card.icon
            return (
              <div key={i} className="card p-4">
                <Icon className="w-4 h-4 text-text-muted mb-2" />
                <div className="text-xs text-text-muted uppercase font-semibold tracking-wider">{card.label}</div>
                <div className="text-2xl font-bold text-nav mt-1">{card.value}</div>
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
            title: 'Risk Intelligence',
            description: 'Automatic detection of IPO blockers and escalation paths',
            icon: AlertCircle,
          },
          {
            title: 'Timeline Intelligence',
            description: 'AI-powered prediction of actual IPO date vs. plan',
            icon: Calendar,
          },
          {
            title: 'Board Ready Reports',
            description: 'Executive summaries in seconds, not days',
            icon: TrendingUp,
          },
        ].map((feature, i) => {
          const Icon = feature.icon
          return (
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-yellow-600 mb-3" />
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
        className="card p-8 text-center border-2 border-yellow-200"
        style={{ background: 'linear-gradient(to right, rgb(254 252 232), rgb(254 243 199))' }}
      >
        <Crown className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">Unlock Executive Visibility</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          The CEO Command Center gives you real-time visibility into IPO readiness, risk alerts,
          and instant board-ready reports. Upgrade to Professional to activate.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-600 text-white text-sm font-semibold hover:bg-yellow-700 transition-all"
        >
          <Crown className="w-4 h-4" />
          Upgrade to Professional
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
      </PremiumPageLayout>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="ceo_dashboard"
        featureName="CEO Command Center"
      />
    </React.Fragment>
  )
}
