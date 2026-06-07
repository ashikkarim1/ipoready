'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, TrendingUp, AlertCircle, CheckCircle2, Clock, Target, Users, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function CEOCommandCenter() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Mock KPI data
  const kpis = [
    { label: 'PACE™ Score', value: '78/100', trend: '+5', icon: Target, color: 'blue', status: 'On Track' },
    { label: 'Milestone Completion', value: '68%', trend: '+12%', icon: CheckCircle2, color: 'green', status: 'Accelerating' },
    { label: 'Team Velocity', value: '42 tasks/week', trend: '+8', icon: TrendingUp, color: 'purple', status: 'Strong' },
    { label: 'Time to Listing', value: '127 days', trend: '-14', icon: Clock, color: 'orange', status: 'Ahead' },
  ]

  const riskAlerts = [
    { level: 'high', title: 'SEC Filing Review', description: 'Prospectus pending SEC comments - response due in 8 days', daysLeft: 8 },
    { level: 'medium', title: 'Underwriter Alignment', description: '2 underwriters need final sign-off on roadshow materials', daysLeft: 3 },
    { level: 'medium', title: 'Board Approval', description: 'Q2 financials require board review before filing', daysLeft: 5 },
  ]

  const boardReadiness = [
    { category: 'Financial Disclosures', completed: 100, status: 'Complete' },
    { category: 'Corporate Governance', completed: 85, status: 'In Progress' },
    { category: 'Legal Compliance', completed: 95, status: 'Complete' },
    { category: 'Regulatory Documentation', completed: 72, status: 'In Progress' },
  ]

  return (
    <>
      <PremiumPageLayout
        title="CEO Command Center"
        subtitle="Real-time executive dashboard with KPIs, risk alerts, and board-ready insights"
        icon={<Crown className="w-8 h-8 text-yellow-600" />}
      >
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Executive KPIs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, idx) => {
                const Icon = kpi.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {kpi.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mb-2">{kpi.label}</p>
                    <p className="text-2xl font-bold text-nav mb-2">{kpi.value}</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <ArrowUpRight className="w-4 h-4" />
                      {kpi.trend}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Risk Alerts */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Critical Alerts</h2>
            <div className="space-y-3">
              {riskAlerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-lg border p-4 ${
                    alert.level === 'high'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-1 ${
                      alert.level === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-nav text-sm">{alert.title}</h3>
                      <p className="text-xs text-text-muted mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-600">{alert.daysLeft}d</span>
                      <p className="text-xs text-text-muted">remaining</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Board Readiness */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Board Readiness Tracker</h2>
            <div className="space-y-4">
              {boardReadiness.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm text-nav">{item.category}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {item.completed}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.completed === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.completed}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-2">{item.status}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <h2 className="text-lg font-bold text-nav mb-4">Projected Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-semibold text-nav">SEC Review</div>
                <div className="flex-1 bg-white rounded-lg h-2 overflow-hidden">
                  <div className="bg-orange-500 h-full" style={{ width: '45%' }} />
                </div>
                <span className="text-xs font-semibold text-text-muted w-16">45% Done</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-semibold text-nav">Marketing</div>
                <div className="flex-1 bg-white rounded-lg h-2 overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: '68%' }} />
                </div>
                <span className="text-xs font-semibold text-text-muted w-16">68% Done</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-semibold text-nav">Pricing</div>
                <div className="flex-1 bg-white rounded-lg h-2 overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '100%' }} />
                </div>
                <span className="text-xs font-semibold text-text-muted w-16">100% Done</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-all"
          >
            Unlock Full Features
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="ceo_dashboard"
        featureName="CEO Command Center"
      />
    </>
  )
}
