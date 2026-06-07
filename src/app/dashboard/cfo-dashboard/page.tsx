'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import PremiumPageLayout from '../components/PremiumPageLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function CFOFinancialDashboard() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <PremiumPageLayout
        title="CFO Financial Dashboard"
        subtitle="Financial modeling, unit economics, runway analysis, and waterfall forecasting"
        icon={<BarChart3 className="w-8 h-8 text-emerald-600" />}
      >
        <div className="space-y-8">
          <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <h2 className="mb-2 text-2xl font-bold text-nav">Coming Soon</h2>
            <p className="text-sm text-text-muted">
              The CFO Financial Dashboard will help with financial modeling and forecasting.
            </p>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="block mx-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all"
          >
            Upgrade to Enterprise
          </button>
        </div>
      </PremiumPageLayout>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey="cfo_dashboard"
        featureName="CFO Financial Dashboard"
      />
    </>
  )
}
