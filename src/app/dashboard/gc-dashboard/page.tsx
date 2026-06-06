'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle2, FileText, AlertCircle } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function GCLegalDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="h1">GC Legal Dashboard</h1>
            </div>
            <p className="text-text-muted">
              Legal compliance tracking, document automation, and regulatory requirements
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Premium Locked */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {/* Legal Dashboard (Locked) */}
          <PremiumLock
            featureKey="gc_dashboard"
            featureName="GC Legal Dashboard"
            badge="gold"
            badgeText="Enterprise"
            className="h-96"
          >
            <div className="space-y-3">
              {[
                {
                  task: 'Corporate Charter Review',
                  dueDate: '2026-06-15',
                  status: 'In Progress',
                  owner: 'Simpson Legal',
                },
                {
                  task: 'Material Agreements Audit',
                  dueDate: '2026-06-22',
                  status: 'Pending',
                  owner: 'Legal Counsel',
                },
                {
                  task: 'Litigation Review',
                  dueDate: '2026-06-20',
                  status: 'Complete',
                  owner: 'Outside Counsel',
                },
                {
                  task: 'IP Diligence',
                  dueDate: '2026-07-01',
                  status: 'Not Started',
                  owner: 'IP Counsel',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3 flex-1">
                    {item.status === 'Complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : item.status === 'In Progress' ? (
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-nav text-sm">{item.task}</div>
                      <div className="text-xs text-text-muted">{item.owner}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-muted">{item.dueDate}</div>
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
                title: 'Compliance Automation',
                description: 'Auto-generate compliance checklists based on IPO timeline',
                icon: CheckCircle2,
              },
              {
                title: 'Document Management',
                description: 'Centralize all legal docs with version control and e-signature',
                icon: FileText,
              },
              {
                title: 'Audit Trail',
                description: 'Complete record of all legal actions and approvals',
                icon: Shield,
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Icon className="w-8 h-8 text-indigo-600 mb-3" />
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
            className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-8 text-center"
          >
            <Shield className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h2 className="h3 mb-2">Centralize Legal Compliance</h2>
            <p className="text-text-muted max-w-lg mx-auto mb-6">
              GC dashboards cut legal work in half. Automate compliance, centralize documents, and
              maintain a complete audit trail for regulators. Reduce GC stress from 200+ hours to 100.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
            >
              <Shield className="w-5 h-5" />
              Upgrade to Enterprise
            </button>
            <p className="text-xs text-text-light mt-3">7-day free trial • Cancel anytime</p>
          </motion.div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="gc_dashboard"
        featureName="GC Legal Dashboard"
      />
    </div>
  )
}
