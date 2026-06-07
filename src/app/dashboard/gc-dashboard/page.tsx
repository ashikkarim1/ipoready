'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function GCLegalDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="GC Legal Dashboard"
        subtitle="Legal compliance tracking, document automation, and regulatory requirements"
        icon={<Shield className="w-8 h-8 text-indigo-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-indigo-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              The GC Legal Dashboard will automate legal compliance tracking and document management.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
          >
            Upgrade to Enterprise
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="gc_dashboard"
        featureName="GC Legal Dashboard"
      />
    </>
  )
}
