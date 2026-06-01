import { sql } from '@/lib/db'

// ============================================================================
// Type Definitions
// ============================================================================

export type FeatureTier = 'starter' | 'growth' | 'enterprise' | 'trial'
export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'

interface CompanySubscription {
  subscription_plan: SubscriptionPlan | null
  subscription_status: SubscriptionStatus | null
  trial_status: string | null
}

export interface UserTierInfo {
  tier: FeatureTier
  subscription_plan: SubscriptionPlan | null
  trial_status: string | null
  subscription_status: SubscriptionStatus | null
}

// ============================================================================
// Feature Definitions
// ============================================================================

export const FEATURES = {
  // PACE™ Core Features
  PACE_BASE_SCORE: ['starter', 'growth', 'enterprise', 'trial'] as FeatureTier[],
  PACE_PREDICTIVE_FACTORS: ['growth', 'enterprise', 'trial'] as FeatureTier[],
  PACE_PEER_COMPARISON: ['growth', 'enterprise', 'trial'] as FeatureTier[],
  PACE_SEQUENCING_ALERTS: ['growth', 'enterprise', 'trial'] as FeatureTier[],

  // Document Management
  DOCUMENT_COMPLETENESS: ['growth', 'enterprise', 'trial'] as FeatureTier[],
  DOCUMENT_UPLOAD: ['growth', 'enterprise', 'trial'] as FeatureTier[],

  // IPO Benchmarking
  IPO_BENCHMARKING: ['enterprise'] as FeatureTier[],
  CUSTOM_BENCHMARKS: ['enterprise'] as FeatureTier[],

  // Advanced Features
  API_ACCESS: ['enterprise'] as FeatureTier[],
  PRIORITY_SUPPORT: ['enterprise'] as FeatureTier[],

  // Team & Collaboration
  TEAM_MEMBERS: ['growth', 'enterprise'] as FeatureTier[],

  // Admin & Control
  ADMIN_PANEL: ['enterprise'] as FeatureTier[],

  // Reporting & Analytics
  EXPORT_REPORTS: ['growth', 'enterprise'] as FeatureTier[],
  HISTORICAL_DATA: ['growth', 'enterprise'] as FeatureTier[],
} as const

// Build reverse lookup: feature -> tiers
const FEATURE_TIERS: Record<string, FeatureTier[]> = {}
Object.entries(FEATURES).forEach(([featureName, tiers]) => {
  FEATURE_TIERS[featureName] = tiers
})

// ============================================================================
// Core Database Functions
// ============================================================================

/**
 * Get company subscription data from database
 */
export async function getCompanySubscription(
  companyId: string
): Promise<CompanySubscription | null> {
  try {
    const result = await sql`
      SELECT subscription_plan, subscription_status, trial_status
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as CompanySubscription
  } catch (error) {
    console.warn(`Failed to get subscription for company ${companyId}:`, error)
    return null
  }
}

/**
 * Get user subscription data by user ID
 * (joins users to companies table)
 */
export async function getUserSubscription(userId: string): Promise<CompanySubscription | null> {
  try {
    const result = await sql`
      SELECT c.subscription_plan, c.subscription_status, c.trial_status
      FROM companies c
      INNER JOIN users u ON u.company_id = c.id
      WHERE u.id = ${userId}
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as CompanySubscription
  } catch (error) {
    console.warn(`Failed to get subscription for user ${userId}:`, error)
    return null
  }
}

// ============================================================================
// Tier Determination Functions
// ============================================================================

/**
 * Determine current tier from subscription data
 * Priority: active trial > active subscription > starter default
 */
export function getTierFromSubscription(
  subscription: CompanySubscription | null
): FeatureTier {
  if (!subscription) {
    return 'starter'
  }

  // Active trial takes priority
  if (subscription.trial_status === 'active') {
    return 'trial'
  }

  // Active paid subscription
  if (
    subscription.subscription_status === 'active' ||
    subscription.subscription_status === 'trialing'
  ) {
    const plan = subscription.subscription_plan as SubscriptionPlan | null
    if (plan === 'enterprise' || plan === 'growth') {
      return plan
    }
  }

  // Default to starter
  return 'starter'
}

/**
 * Get complete tier information for a user
 */
export async function getUserTier(userId: string): Promise<UserTierInfo> {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    return {
      tier: 'starter',
      subscription_plan: null,
      trial_status: null,
      subscription_status: null,
    }
  }

  return {
    tier: getTierFromSubscription(subscription),
    subscription_plan: subscription.subscription_plan,
    trial_status: subscription.trial_status,
    subscription_status: subscription.subscription_status,
  }
}

/**
 * Get complete tier information for a company
 */
export async function getCompanyTier(companyId: string): Promise<UserTierInfo> {
  const subscription = await getCompanySubscription(companyId)

  if (!subscription) {
    return {
      tier: 'starter',
      subscription_plan: null,
      trial_status: null,
      subscription_status: null,
    }
  }

  return {
    tier: getTierFromSubscription(subscription),
    subscription_plan: subscription.subscription_plan,
    trial_status: subscription.trial_status,
    subscription_status: subscription.subscription_status,
  }
}

// ============================================================================
// Feature Access Functions
// ============================================================================

/**
 * Check if a feature is available for a given tier
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

/**
 * Check if a user can access a feature
 */
export async function userCanAccessFeature(
  userId: string,
  featureName: string
): Promise<boolean> {
  const tierInfo = await getUserTier(userId)
  return canAccessFeature(tierInfo.tier, featureName)
}

/**
 * Check if a company can access a feature
 */
export async function companyCanAccessFeature(
  companyId: string,
  featureName: string
): Promise<boolean> {
  const tierInfo = await getCompanyTier(companyId)
  return canAccessFeature(tierInfo.tier, featureName)
}

// ============================================================================
// Feature List Functions
// ============================================================================

/**
 * Get all features available to a tier
 */
export function getFeatureList(tier: FeatureTier): string[] {
  return Object.entries(FEATURES)
    .filter(([, tiers]) => tiers.includes(tier))
    .map(([name]) => name)
}

/**
 * Get all features available to a user
 */
export async function getUserFeatures(userId: string): Promise<string[]> {
  const tierInfo = await getUserTier(userId)
  return getFeatureList(tierInfo.tier)
}

/**
 * Get all features available to a company
 */
export async function getCompanyFeatures(companyId: string): Promise<string[]> {
  const tierInfo = await getCompanyTier(companyId)
  return getFeatureList(tierInfo.tier)
}

// ============================================================================
// Upgrade Helper Functions
// ============================================================================

export interface UpgradeInfo {
  required: boolean
  currentTier: FeatureTier
  suggestedTier?: FeatureTier
  upgradeUrl?: string
}

/**
 * Determine if upgrade is required for a feature and suggest tier
 */
export async function upgradeRequired(
  userId: string,
  featureName: string
): Promise<UpgradeInfo> {
  const tierInfo = await getUserTier(userId)
  const hasAccess = canAccessFeature(tierInfo.tier, featureName)

  if (hasAccess) {
    return {
      required: false,
      currentTier: tierInfo.tier,
    }
  }

  // Feature not available - suggest minimum required tier
  const allowedTiers = FEATURE_TIERS[featureName]
  let suggestedTier: FeatureTier = 'growth'

  if (allowedTiers && allowedTiers.includes('enterprise')) {
    suggestedTier = 'enterprise'
  } else if (allowedTiers && allowedTiers.some((t) => t !== 'starter')) {
    suggestedTier = 'growth'
  }

  return {
    required: true,
    currentTier: tierInfo.tier,
    suggestedTier,
    upgradeUrl: `/app/checkout?upgrade_from=${tierInfo.subscription_plan || 'starter'}&to=${suggestedTier}`,
  }
}

/**
 * Check upgrade requirement for a company
 */
export async function companyUpgradeRequired(
  companyId: string,
  featureName: string
): Promise<UpgradeInfo> {
  const tierInfo = await getCompanyTier(companyId)
  const hasAccess = canAccessFeature(tierInfo.tier, featureName)

  if (hasAccess) {
    return {
      required: false,
      currentTier: tierInfo.tier,
    }
  }

  // Feature not available - suggest minimum required tier
  const allowedTiers = FEATURE_TIERS[featureName]
  let suggestedTier: FeatureTier = 'growth'

  if (allowedTiers && allowedTiers.includes('enterprise')) {
    suggestedTier = 'enterprise'
  } else if (allowedTiers && allowedTiers.some((t) => t !== 'starter')) {
    suggestedTier = 'growth'
  }

  return {
    required: true,
    currentTier: tierInfo.tier,
    suggestedTier,
    upgradeUrl: `/app/checkout?upgrade_from=${tierInfo.subscription_plan || 'starter'}&to=${suggestedTier}`,
  }
}

// ============================================================================
// Plan Limits & Information
// ============================================================================

export interface PlanLimits {
  companies: number | string
  team_members: number | string
  documents_storage_gb: number | string
  api_calls_per_month: number | string
  monthly_price_usd: number
}

/**
 * Get plan-specific limits
 */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  const limits: Record<SubscriptionPlan, PlanLimits> = {
    starter: {
      companies: 1,
      team_members: 3,
      documents_storage_gb: 5,
      api_calls_per_month: 0,
      monthly_price_usd: 299,
    },
    growth: {
      companies: 'unlimited',
      team_members: 10,
      documents_storage_gb: 50,
      api_calls_per_month: 10000,
      monthly_price_usd: 799,
    },
    enterprise: {
      companies: 'unlimited',
      team_members: 'unlimited',
      documents_storage_gb: 'unlimited',
      api_calls_per_month: 'unlimited',
      monthly_price_usd: 1999,
    },
  }

  return limits[plan]
}

// ============================================================================
// Subscription Management Functions
// ============================================================================

/**
 * Upgrade trial to paid subscription
 */
export async function upgradeTrial(
  companyId: string,
  stripeSubscriptionId: string,
  plan: SubscriptionPlan
) {
  try {
    await sql`
      UPDATE companies
      SET
        trial_status = 'upgraded',
        trial_converted_at = NOW(),
        trial_conversion_plan = ${plan},
        subscription_id = ${stripeSubscriptionId},
        subscription_status = 'active',
        subscription_plan = ${plan}
      WHERE id = ${companyId}
    `
  } catch (error) {
    console.error(`Failed to upgrade trial for company ${companyId}:`, error)
    throw error
  }
}

/**
 * Downgrade subscription to a different plan
 */
export async function downgradeSubscription(
  companyId: string,
  plan: SubscriptionPlan
) {
  try {
    await sql`
      UPDATE companies
      SET subscription_plan = ${plan}
      WHERE id = ${companyId}
    `
  } catch (error) {
    console.error(`Failed to downgrade subscription for company ${companyId}:`, error)
    throw error
  }
}

/**
 * Check if company has active subscription
 */
export function isSubscriptionActive(subscription: CompanySubscription | null): boolean {
  if (!subscription) return false

  // Active trials count as active
  if (subscription.trial_status === 'active') {
    return true
  }

  // Active subscriptions count
  if (subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing') {
    return true
  }

  return false
}

// ============================================================================
// Rate Limiting & Resource Checks
// ============================================================================

/**
 * Check if company can perform resource-intensive operations
 */
export async function checkRateLimit(
  companyId: string,
  operation: string
): Promise<boolean> {
  const subscription = await getCompanySubscription(companyId)

  if (!subscription || !isSubscriptionActive(subscription)) {
    // Non-subscribed companies have strict limits
    return false
  }

  const tier = getTierFromSubscription(subscription)

  // Enterprise has no rate limits
  if (tier === 'enterprise') {
    return true
  }

  // Growth plan can do most things
  if (tier === 'growth' && operation !== 'unlimited_api') {
    return true
  }

  // Starter and trial have limited operations
  if (tier === 'starter' || tier === 'trial') {
    return !['advanced_integrations', 'bulk_operations', 'ai_features'].includes(operation)
  }

  return false
}

// ============================================================================
// Backward Compatibility Exports
// ============================================================================

// For legacy code that uses FEATURE_MATRIX
export const FEATURE_MATRIX: Record<SubscriptionPlan, Set<string>> = {
  starter: new Set([
    'dashboard',
    'basic_tasks',
    'one_company',
    'basic_analytics',
    'email_support',
  ]),
  growth: new Set([
    'dashboard',
    'advanced_tasks',
    'multiple_companies',
    'advanced_analytics',
    'pace_benchmarking',
    'document_tracking',
    'priority_support',
    'integrations',
  ]),
  enterprise: new Set([
    'dashboard',
    'advanced_tasks',
    'unlimited_companies',
    'advanced_analytics',
    'pace_benchmarking',
    'document_tracking',
    'custom_workflows',
    'api_access',
    'sso',
    'dedicated_support',
    'custom_features',
  ]),
}

/**
 * Legacy function: get effective plan from subscription (backward compatible)
 */
export function getEffectivePlan(subscription: CompanySubscription): SubscriptionPlan {
  const tier = getTierFromSubscription(subscription)

  // Convert trial tier to actual plan
  if (tier === 'trial' && subscription.subscription_plan) {
    return subscription.subscription_plan as SubscriptionPlan
  }

  // Convert trial tier to starter if no plan set
  if (tier === 'trial') {
    return 'starter'
  }

  return tier as SubscriptionPlan
}

/**
 * Legacy function: check feature access with subscription object
 */
export function canAccessFeatureLegacy(
  subscription: CompanySubscription | null,
  feature: string
): boolean {
  if (!subscription) {
    // Only allow starter features for non-subscribed
    return FEATURE_MATRIX['starter'].has(feature)
  }

  // Check if subscription is active
  if (!isSubscriptionActive(subscription)) {
    // Expired or cancelled - only starter features
    return FEATURE_MATRIX['starter'].has(feature)
  }

  // Get effective plan and check feature access
  const plan = getEffectivePlan(subscription)
  return FEATURE_MATRIX[plan].has(feature)
}

/**
 * Legacy function: check feature access with company ID
 */
export async function checkFeatureAccess(
  companyId: string,
  feature: string
): Promise<{
  allowed: boolean
  plan: SubscriptionPlan
  isActive: boolean
  reason?: string
}> {
  const subscription = await getCompanySubscription(companyId)

  if (!subscription) {
    return {
      allowed: feature === 'basic_tasks' || feature === 'dashboard',
      plan: 'starter',
      isActive: false,
      reason: 'No subscription found',
    }
  }

  const isActive = isSubscriptionActive(subscription)
  const plan = getEffectivePlan(subscription)
  const allowed = canAccessFeatureLegacy(subscription, feature)

  return {
    allowed,
    plan,
    isActive,
    reason: allowed ? undefined : `Feature "${feature}" not available on ${plan} plan`,
  }
}

/**
 * Legacy function: get available features
 */
export function getAvailableFeatures(subscription: CompanySubscription): string[] {
  if (!subscription || !isSubscriptionActive(subscription)) {
    return Array.from(FEATURE_MATRIX['starter'])
  }

  const plan = getEffectivePlan(subscription)
  return Array.from(FEATURE_MATRIX[plan])
}
