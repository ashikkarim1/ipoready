'use client'

import { Lock, Zap } from 'lucide-react'
import { useState } from 'react'
import UpgradeModal from './UpgradeModal'

interface PremiumLockProps {
  featureKey: string
  featureName: string
  badge?: 'gold' | 'blue' | 'red'
  badgeText?: string
  children?: React.ReactNode
  className?: string
}

/**
 * Premium Lock Component
 * Shows a locked overlay on premium features with clear upgrade CTA
 */
export default function PremiumLock({
  featureKey,
  featureName,
  badge = 'gold',
  badgeText = 'Premium',
  children,
  className = '',
}: PremiumLockProps) {
  const [showModal, setShowModal] = useState(false)

  const badgeColors = {
    gold: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border border-blue-300',
    red: 'bg-red-100 text-red-800 border border-red-300',
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Content (blurred if not accessed) */}
        <div className="opacity-50 pointer-events-none blur-sm">{children}</div>

        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-900/10 to-slate-900/5 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm shadow-lg border border-slate-200">
            {/* Badge */}
            <div className="inline-block mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColors[badge]}`}>
                {badgeText}
              </span>
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>

            {/* Text */}
            <h3 className="font-semibold text-nav mb-2">{featureName}</h3>
            <p className="text-sm text-text-muted mb-4">
              Upgrade to unlock this premium feature and transform your IPO execution.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-opacity-90 transition-all w-full"
            >
              <Zap className="w-4 h-4" />
              Upgrade Now
            </button>

            {/* Secondary text */}
            <p className="text-xs text-text-light mt-3">
              7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureKey={featureKey}
        featureName={featureName}
      />
    </>
  )
}
