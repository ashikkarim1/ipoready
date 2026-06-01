'use client'

import { SubscriptionPlan } from '@/hooks/useSubscription'

interface FeatureLockedOverlayProps {
  isOpen: boolean
  featureName: string
  requiredPlan: SubscriptionPlan
  currentPlan: SubscriptionPlan
  onClose: () => void
  onUpgrade: () => void
}

export function FeatureLockedOverlay({
  isOpen,
  featureName,
  requiredPlan,
  currentPlan,
  onClose,
  onUpgrade,
}: FeatureLockedOverlayProps) {
  if (!isOpen) return null

  const PLAN_LABELS: Record<SubscriptionPlan, string> = {
    starter: 'Starter',
    growth: 'Growth',
    enterprise: 'Enterprise',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal - bottom sheet on mobile, centered on desktop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-t-lg sm:rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔒</span>
              <h2 className="text-lg font-semibold text-gray-900">
                {featureName} Locked
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              <strong>{featureName}</strong> is available in the{' '}
              <strong>{PLAN_LABELS[requiredPlan]}</strong> plan and above.
            </p>

            {/* Plan comparison */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-3">Plan Comparison</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Your plan</span>
                  <span className="font-semibold text-gray-900">
                    {PLAN_LABELS[currentPlan]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Required plan</span>
                  <span className="font-semibold text-blue-600">
                    {PLAN_LABELS[requiredPlan]} or higher
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-600 mb-6">
              Upgrade to access {featureName} and enjoy all the benefits of a premium plan.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
