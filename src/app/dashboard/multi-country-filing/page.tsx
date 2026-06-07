'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function MultiCountryFilingSystem() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="Multi-Country Filing System"
        subtitle="File in SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and 50+ exchanges from one platform"
        icon={<Globe className="w-8 h-8 text-teal-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 p-8 text-center">
            <Globe className="mx-auto mb-4 h-12 w-12 text-teal-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              File in 50+ exchanges from one platform. Multi-country filing made simple.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all"
          >
            Upgrade to Enterprise
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="multi_country_filing"
        featureName="Multi-Country Filing System"
      />
    </>
  )
}
