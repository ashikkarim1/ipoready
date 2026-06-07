'use client'

import { useState } from 'react'
import { Crown } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function CEOCommandCenter() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="CEO Command Center"
        subtitle="Real-time executive dashboard with KPIs, risk alerts, and board-ready insights"
        icon={<Crown className="w-8 h-8 text-yellow-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 text-center">
            <Crown className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              The CEO Command Center will provide real-time KPIs, risk alerts, and board-ready insights.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-all"
          >
            Upgrade to Professional
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
