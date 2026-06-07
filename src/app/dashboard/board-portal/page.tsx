'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, TrendingUp, AlertTriangle, CheckCircle2, Calendar, MessageSquare, Download } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function BoardIntelligencePortal() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const boardMetrics = [
    { label: 'Board Members', value: '8', trend: 'Active', icon: Users },
    { label: 'Approval Rate', value: '100%', trend: 'Current', icon: CheckCircle2 },
    { label: 'Avg Response Time', value: '1.2 days', trend: 'Improving', icon: Calendar },
    { label: 'Document Reviews', value: '24 completed', trend: '+6 pending', icon: FileText },
  ]

  const boardPackages = [
    {
      date: 'Jun 15, 2026',
      title: 'Q2 Financial Review + SEC Prospectus',
      documents: 12,
      status: 'Ready for Review',
      priority: 'high',
    },
    {
      date: 'Jun 10, 2026',
      title: 'Underwriter Due Diligence Summary',
      documents: 8,
      status: 'Under Review',
      priority: 'high',
    },
    {
      date: 'Jun 5, 2026',
      title: 'Governance & Compliance Audit',
      documents: 15,
      status: 'Completed',
      priority: 'medium',
    },
  ]

  const boardMeetings = [
    { date: 'Jun 20, 2026', topic: 'IPO Approval Vote', attendees: 8, status: 'Scheduled' },
    { date: 'Jun 15, 2026', topic: 'Financial Results Review', attendees: 8, status: 'Scheduled' },
    { date: 'Jun 10, 2026', topic: 'SEC Feedback Discussion', attendees: 6, status: 'Completed' },
  ]

  return (
    <>
      <PremiumPageLayout
        title="Board Intelligence Portal"
        subtitle="Centralized board communications, document review, and meeting coordination"
        icon={<Users className="w-8 h-8 text-blue-600" />}
      >
        <div className="space-y-8">
          {/* Board Metrics */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Board Engagement Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {boardMetrics.map((metric, idx) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6"
                  >
                    <Icon className="w-6 h-6 text-blue-600 mb-3" />
                    <p className="text-sm text-text-muted mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-nav mb-2">{metric.value}</p>
                    <p className="text-xs text-blue-600 font-semibold">{metric.trend}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Board Packages */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Board Packages</h2>
            <div className="space-y-3">
              {boardPackages.map((pkg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-nav text-sm">{pkg.title}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          pkg.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {pkg.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>{pkg.documents} documents</span>
                        <span>•</span>
                        <span>{pkg.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        pkg.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : pkg.status === 'Ready for Review'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pkg.status}
                      </span>
                      <button className="mt-2 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Board Meetings */}
          <div>
            <h2 className="text-lg font-bold text-nav mb-4">Board Meetings</h2>
            <div className="space-y-3">
              {boardMeetings.map((meeting, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-nav text-sm">{meeting.topic}</p>
                        <p className="text-xs text-text-muted mt-1">{meeting.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-text-muted">{meeting.attendees} attendees</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          meeting.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Communication Stats */}
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6">
            <h2 className="text-lg font-bold text-nav mb-4">Board Communication Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-nav mb-1">47</p>
                <p className="text-sm text-text-muted">Total Messages Sent</p>
              </div>
              <div className="text-center p-4 border-l border-r border-gray-200">
                <p className="text-3xl font-bold text-nav mb-1">3.2h</p>
                <p className="text-sm text-text-muted">Avg Response Time</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-nav mb-1">98%</p>
                <p className="text-sm text-text-muted">Read Rate</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
          >
            Unlock Full Access
          </button>
        </div>
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
