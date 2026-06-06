'use client'

import { motion } from 'framer-motion'
import { Crown, AlertCircle, TrendingUp, Users, Calendar, Target } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function CEOCommandCenter() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-600" />
              <h1 className="h1">CEO Command Center</h1>
            </div>
            <p className="text-text-muted">
              Real-time executive dashboard with key metrics, risk alerts, and board-ready insights
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Dashboard Grid (Locked) */}
          <PremiumLock
            featureKey="ceo_dashboard"
            featureName="CEO Command Center"
            badge="gold"
            badgeText="Premium"
            className="h-96"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              {[
                { label: 'IPO Readiness', value: '73%', icon: Target },
                { label: 'Days to IPO', value: '247', icon: Calendar },
                { label: 'Active Tasks', value: '12', icon: AlertCircle },
                { label: 'Team Members', value: '8', icon: Users },
              ].map((card, i) => {
                const Icon = card.icon
                return (
                  <div key={i} className="bg-white rounded-lg p-4 border border-slate-200">
                    <Icon className="w-5 h-5 text-slate-400 mb-2" />
                    <div className="text-sm text-text-muted">{card.label}</div>
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
            className="grid md:grid-cols-3 gap-4"
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
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-yellow-600 mb-3" />
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
            className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-8 text-center"
          >
            <Crown className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">Unlock Executive Visibility</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              The CEO Command Center gives you real-time visibility into IPO readiness, risk alerts,
              and instant board-ready reports. Upgrade to Professional to activate.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-all"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Professional
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="ceo_dashboard"
        featureName="CEO Command Center"
      />
    </div>
  )
}
