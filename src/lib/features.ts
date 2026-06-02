/**
 * Feature gates and tier definitions
 * This module is client-safe and can be imported from client components
 */

export type FeatureTier = 'starter' | 'growth' | 'enterprise' | 'trial'
export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'

/**
 * Feature access matrix: which tiers can access which features
 */
export const FEATURE_TIERS: Record<string, FeatureTier[]> = {
  // PACE™ Core Features
  PACE_BASE_SCORE: ['starter', 'growth', 'enterprise', 'trial'],
  PACE_PREDICTIVE_FACTORS: ['growth', 'enterprise', 'trial'],
  PACE_PEER_COMPARISON: ['growth', 'enterprise', 'trial'],
  PACE_SEQUENCING_ALERTS: ['growth', 'enterprise', 'trial'],

  // Document Management
  DOCUMENT_COMPLETENESS: ['growth', 'enterprise', 'trial'],
  DOCUMENT_UPLOAD: ['growth', 'enterprise', 'trial'],
  PROSPECTUS_BUILDER: ['growth', 'enterprise', 'trial'],

  // IPO Benchmarking
  IPO_BENCHMARKING: ['enterprise'],
  CUSTOM_BENCHMARKS: ['enterprise'],

  // Advanced Features
  API_ACCESS: ['enterprise'],
  PRIORITY_SUPPORT: ['enterprise'],

  // Team & Collaboration
  TEAM_MEMBERS: ['growth', 'enterprise'],

  // Admin & Control
  ADMIN_PANEL: ['enterprise'],

  // Reporting & Analytics
  EXPORT_REPORTS: ['growth', 'enterprise'],
  HISTORICAL_DATA: ['growth', 'enterprise'],
}

/**
 * Check if a tier can access a feature
 * Pure utility function safe for client components
 */
export function canAccessFeature(
  tier: FeatureTier,
  featureName: string
): boolean {
  const allowedTiers = FEATURE_TIERS[featureName]

  if (!allowedTiers) {
    console.warn(`Undefined feature requested: ${featureName}`)
    return false
  }

  return allowedTiers.includes(tier)
}
