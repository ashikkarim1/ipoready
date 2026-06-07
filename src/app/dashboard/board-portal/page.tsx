'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function BoardIntelligencePortal() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="Board Intelligence Portal"
        subtitle="Board materials, governance tracking, and meeting management in one place"
        icon={<Users className="w-8 h-8 text-blue-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-blue-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              The Board Intelligence Portal will help you manage board materials and governance tracking in one place.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
          >
            Upgrade to Professional
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
