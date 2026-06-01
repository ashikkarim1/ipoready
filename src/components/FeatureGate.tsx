'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { FeatureTier } from '@/lib/feature-gates'

export interface FeatureGateProps {
  feature: string
  tier: FeatureTier
  children: ReactNode
  fallback?: ReactNode
  onAccessDenied?: (feature: string, suggestedTier: FeatureTier) => void
}

/**
 * FeatureGate Component
 *
 * Conditionally renders child content based on feature access for a given tier.
 * If user doesn't have access, shows fallback (default: UpgradePrompt).
 *
 * Usage:
 * <FeatureGate feature="CUSTOM_BENCHMARKS" tier="growth">
 *   <CustomBenchmarkPanel />
 * </FeatureGate>
 *
 * Or with custom fallback:
 * <FeatureGate
 *   feature="API_ACCESS"
 *   tier="starter"
 *   fallback={<p>Upgrade to Enterprise for API access</p>}
 * >
 *   <APIPanel />
 * </FeatureGate>
 */
export const FeatureGate = React.memo(function FeatureGate({
  feature,
  tier,
  children,
  fallback,
  onAccessDenied,
}: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [suggestedTier, setSuggestedTier] = useState<FeatureTier>('growth')

  useEffect(() => {
    // Determine access based on tier
    const tierHierarchy: Record<FeatureTier, number> = {
      starter: 0,
      trial: 1,
      growth: 2,
      enterprise: 3,
    }

    // Simple access check: determine minimum required tier for feature
    const getMinimumTier = (featureName: string): FeatureTier => {
      // Enterprise-only features
      const enterpriseFeatures = [
        'IPO_BENCHMARKING',
        'CUSTOM_BENCHMARKS',
        'API_ACCESS',
        'PRIORITY_SUPPORT',
        'ADMIN_PANEL',
      ]

      // Growth features (includes enterprise)
      const growthFeatures = [
        'PACE_PREDICTIVE_FACTORS',
        'PACE_PEER_COMPARISON',
        'PACE_SEQUENCING_ALERTS',
        'DOCUMENT_COMPLETENESS',
        'DOCUMENT_UPLOAD',
        'TEAM_MEMBERS',
        'EXPORT_REPORTS',
        'HISTORICAL_DATA',
      ]

      if (enterpriseFeatures.includes(featureName)) {
        return 'enterprise'
      }

      if (growthFeatures.includes(featureName)) {
        return 'growth'
      }

      // PACE_BASE_SCORE is available to all
      return 'starter'
    }

    const minTier = getMinimumTier(feature)
    const userTierValue = tierHierarchy[tier]
    const minTierValue = tierHierarchy[minTier]
    const access = userTierValue >= minTierValue

    setHasAccess(access)
    setSuggestedTier(minTier)

    if (!access && onAccessDenied) {
      onAccessDenied(feature, minTier)
    }
  }, [feature, tier, onAccessDenied])

  if (hasAccess) {
    return <>{children}</>
  }

  // Show fallback UI
  if (fallback) {
    return <>{fallback}</>
  }

  // Default fallback: UpgradePrompt
  return <DefaultUpgradePrompt feature={feature} suggestedTier={suggestedTier} />
})

FeatureGate.displayName = 'FeatureGate'

/**
 * DefaultUpgradePrompt Component
 *
 * Shows a user-friendly message when a feature is not available
 */
interface DefaultUpgradePromptProps {
  feature: string
  suggestedTier: FeatureTier
}

const DefaultUpgradePrompt = ({ feature, suggestedTier }: DefaultUpgradePromptProps) => {
  const tierLabels: Record<FeatureTier, string> = {
    starter: 'Starter',
    growth: 'Growth',
    enterprise: 'Enterprise',
    trial: 'Trial',
  }

  const featureLabels: Record<string, string> = {
    PACE_BASE_SCORE: 'PACE Base Score',
    PACE_PREDICTIVE_FACTORS: 'PACE Predictive Factors',
    PACE_PEER_COMPARISON: 'PACE Peer Comparison',
    PACE_SEQUENCING_ALERTS: 'PACE Sequencing Alerts',
    DOCUMENT_COMPLETENESS: 'Document Completeness',
    DOCUMENT_UPLOAD: 'Document Upload',
    IPO_BENCHMARKING: 'IPO Benchmarking',
    CUSTOM_BENCHMARKS: 'Custom Benchmarks',
    API_ACCESS: 'API Access',
    PRIORITY_SUPPORT: 'Priority Support',
    TEAM_MEMBERS: 'Team Members',
    ADMIN_PANEL: 'Admin Panel',
    EXPORT_REPORTS: 'Export Reports',
    HISTORICAL_DATA: 'Historical Data',
  }

  const featureLabel = featureLabels[feature] || feature

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">Feature Not Available</h3>
          <p className="mt-1 text-sm text-amber-800">
            <strong>{featureLabel}</strong> is available in the{' '}
            <strong>{tierLabels[suggestedTier]}</strong> plan and above.
          </p>
          <a
            href={`/app/checkout?upgrade_to=${suggestedTier}`}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Upgrade Now
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

export default FeatureGate
