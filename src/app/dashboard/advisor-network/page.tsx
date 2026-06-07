'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function AdvisorOrchestrationNetwork() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="Advisor Orchestration Network"
        subtitle="Coordinate 15-30 advisors with dependency tracking and automated escalation"
        icon={<Users className="w-8 h-8 text-red-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              The Advisor Orchestration Network will help you coordinate all your advisors in one place with dependency tracking and automated escalation.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
          >
            Upgrade to Enterprise
          </button>
        </div>
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
