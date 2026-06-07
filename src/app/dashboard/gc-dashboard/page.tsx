'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle2, FileText, AlertCircle } from 'lucide-react'
import PremiumLock from '../components/PremiumLock'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'
import { useState } from 'react'

export default function GCLegalDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <React.Fragment>
      <PremiumPageLayout
      title="GC Legal Dashboard"
      subtitle="Legal compliance tracking, document automation, and regulatory requirements"
      icon={<Shield className="w-8 h-8 text-indigo-600" />}
    >
      <div className="space-y-5">
      {/* Legal Dashboard (Locked) */}
      <PremiumLock
        featureKey="gc_dashboard"
        featureName="GC Legal Dashboard"
        badge="gold"
        badgeText="Enterprise"
        className="h-80"
      >
        <div className="space-y-2">
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
            <div key={i} className="flex items-center justify-between p-3 card">
              <div className="flex items-center gap-3 flex-1">
                {item.status === 'Complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : item.status === 'In Progress' ? (
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                )}
                <div>
                  <p className="text-nav text-sm font-semibold">{item.task}</p>
                  <p className="text-text-muted text-xs mt-0.5">{item.owner}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text-muted text-xs">{item.dueDate}</p>
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
            <div key={i} className="card p-6">
              <Icon className="w-6 h-6 text-indigo-600 mb-3" />
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
        className="card p-8 text-center border-2 border-indigo-200"
        style={{ background: 'linear-gradient(to right, rgb(238 245 255), rgb(224 242 254))' }}
      >
        <Shield className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
        <h2 className="serif text-2xl text-nav mb-2">Centralize Legal Compliance</h2>
        <p className="text-text-muted text-sm max-w-lg mx-auto mb-6">
          GC dashboards cut legal work in half. Automate compliance, centralize documents, and
          maintain a complete audit trail for regulators. Reduce GC stress from 200+ hours to 100.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
        >
          <Shield className="w-4 h-4" />
          Upgrade to Enterprise
        </button>
        <p className="text-text-light text-xs mt-3">7-day free trial • Cancel anytime</p>
      </motion.div>
      </PremiumPageLayout>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="gc_dashboard"
        featureName="GC Legal Dashboard"
      />
    </React.Fragment>
  )
}
