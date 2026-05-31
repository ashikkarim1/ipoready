import { sql } from '@/lib/db'

export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired'

interface CompanySubscription {
  subscription_plan: SubscriptionPlan | null
  subscription_status: SubscriptionStatus | null
  trial_status: string | null
}

// Feature definitions by plan
const FEATURE_MATRIX: Record<SubscriptionPlan, Set<string>> = {
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

export async function getCompanySubscription(
  companyId: string
): Promise<CompanySubscription | null> {
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
}

export function isSubscriptionActive(
  subscription: CompanySubscription
): boolean {
  if (!subscription) return false

  // Active trials count as active
  if (subscription.trial_status === 'active') {
    return true
  }

  // Active subscriptions count
  if (subscription.subscription_status === 'active') {
    return true
  }

  // Trial subscriptions (during Stripe creation) count
  if (subscription.subscription_status === 'trialing') {
    return true
  }

  return false
}

export function getEffectivePlan(subscription: CompanySubscription): SubscriptionPlan {
  // During active trial, use trial plan
  if (subscription.trial_status === 'active' && subscription.subscription_plan) {
    return subscription.subscription_plan as SubscriptionPlan
  }

  // Use subscription plan
  if (subscription.subscription_plan) {
    return subscription.subscription_plan as SubscriptionPlan
  }

  // Default to starter
  return 'starter'
}

export function canAccessFeature(
  subscription: CompanySubscription | null,
  feature: string
): boolean {
  if (!subscription) {
    // Only allow free tier features for non-subscribed
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
  const allowed = canAccessFeature(subscription, feature)

  return {
    allowed,
    plan,
    isActive,
    reason: allowed
      ? undefined
      : `Feature "${feature}" not available on ${plan} plan`,
  }
}

export function getAvailableFeatures(subscription: CompanySubscription): string[] {
  if (!subscription || !isSubscriptionActive(subscription)) {
    return Array.from(FEATURE_MATRIX['starter'])
  }

  const plan = getEffectivePlan(subscription)
  return Array.from(FEATURE_MATRIX[plan])
}

// Helper to get plan-specific limits
export function getPlanLimits(plan: SubscriptionPlan) {
  const limits: Record<SubscriptionPlan, Record<string, number | string>> = {
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

// Helper to upgrade trial to paid subscription
export async function upgradeTrial(
  companyId: string,
  stripeSubscriptionId: string,
  plan: SubscriptionPlan
) {
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
}

// Helper to downgrade subscription
export async function downgradeSubscription(
  companyId: string,
  plan: SubscriptionPlan
) {
  await sql`
    UPDATE companies
    SET subscription_plan = ${plan}
    WHERE id = ${companyId}
  `
}

// Check if company can perform resource-intensive operations
export async function checkRateLimit(
  companyId: string,
  operation: string
): Promise<boolean> {
  const subscription = await getCompanySubscription(companyId)

  if (!subscription || !isSubscriptionActive(subscription)) {
    // Non-subscribed companies have strict limits
    return false
  }

  const plan = getEffectivePlan(subscription)

  // Enterprise has no rate limits
  if (plan === 'enterprise') {
    return true
  }

  // Growth plan can do most things
  if (plan === 'growth' && operation !== 'unlimited_api') {
    return true
  }

  // Starter plan has basic limits
  if (plan === 'starter') {
    return !['advanced_integrations', 'bulk_operations', 'ai_features'].includes(
      operation
    )
  }

  return false
}
