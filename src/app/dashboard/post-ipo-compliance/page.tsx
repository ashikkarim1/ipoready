'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function PostIPOComplianceModule() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="Post-IPO Compliance Module"
        subtitle="Automated compliance for 12+ months post-listing (quiet period, reporting, filings)"
        icon={<CheckCircle2 className="w-8 h-8 text-purple-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-purple-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              The Post-IPO Compliance Module will automate compliance for 12+ months post-listing.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all"
          >
            Upgrade to Enterprise
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="post_ipo_compliance"
        featureName="Post-IPO Compliance Module"
      />
    </>
  )
}
