/**
 * Premium Feature Management
 * Handles feature availability, tier checks, and activation
 */

import { sql } from '@/lib/db'

export interface PremiumFeature {
  id: bigint
  feature_key: string
  display_name: string
  description: string
  category: 'dashboards' | 'coordination' | 'execution' | 'post-ipo'
  icon: string
  badge_text: string
  badge_color: 'gold' | 'blue' | 'red'
  value_prop: string
  monthly_value_usd: number
  min_tier_id: bigint
}

export interface SubscriptionTier {
  id: bigint
  name: string
  display_name: string
  price_monthly_usd: number
  price_annual_usd: number
  description: string
  features: string[]
}

export interface CompanySubscription {
  id: bigint
  company_id: bigint
  tier_id: bigint
  status: 'active' | 'cancelled' | 'paused' | 'past_due'
  current_period_start: string
  current_period_end: string
  trial_ends_at: string | null
}

/**
 * Check if company has access to a premium feature
 */
export async function hasFeatureAccess(
  companyId: bigint,
  featureKey: string
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1
      FROM feature_activations fa
      JOIN premium_features pf ON fa.feature_id = pf.id
      WHERE fa.company_id = ${companyId}
      AND pf.feature_key = ${featureKey}
      AND fa.deactivated_at IS NULL
      LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error('Feature access check failed:', error)
    return false
  }
}

/**
 * Get company's current subscription
 */
export async function getCompanySubscription(companyId: bigint): Promise<CompanySubscription | null> {
  try {
    const result = await sql`
      SELECT
        id, company_id, tier_id, status, current_period_start,
        current_period_end, trial_ends_at
      FROM company_subscriptions
      WHERE company_id = ${companyId}
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `
    return result.length > 0 ? (result[0] as CompanySubscription) : null
  } catch (error) {
    console.error('Subscription fetch failed:', error)
    return null
  }
}

/**
 * Get subscription tier details
 */
export async function getSubscriptionTier(tierId: bigint): Promise<SubscriptionTier | null> {
  try {
    const result = await sql`
      SELECT id, name, display_name, price_monthly_usd, price_annual_usd, description, features
      FROM subscription_tiers
      WHERE id = ${tierId}
      LIMIT 1
    `
    return result.length > 0 ? (result[0] as SubscriptionTier) : null
  } catch (error) {
    console.error('Tier fetch failed:', error)
    return null
  }
}

/**
 * Get all available premium features grouped by tier
 */
export async function getPremiumFeaturesByTier(): Promise<Map<string, PremiumFeature[]>> {
  try {
    const features = await sql`
      SELECT
        pf.id, pf.feature_key, pf.display_name, pf.description,
        pf.category, pf.icon, pf.badge_text, pf.badge_color,
        pf.value_prop, pf.monthly_value_usd, pf.min_tier_id,
        st.name as tier_name
      FROM premium_features pf
      JOIN subscription_tiers st ON pf.min_tier_id = st.id
      ORDER BY pf.min_tier_id, pf.category, pf.display_name
    `

    const grouped = new Map<string, PremiumFeature[]>()
    for (const feature of features as any[]) {
      const tierName = feature.tier_name
      if (!grouped.has(tierName)) {
        grouped.set(tierName, [])
      }
      grouped.get(tierName)!.push({
        id: feature.id,
        feature_key: feature.feature_key,
        display_name: feature.display_name,
        description: feature.description,
        category: feature.category,
        icon: feature.icon,
        badge_text: feature.badge_text,
        badge_color: feature.badge_color,
        value_prop: feature.value_prop,
        monthly_value_usd: feature.monthly_value_usd,
        min_tier_id: feature.min_tier_id,
      })
    }
    return grouped
  } catch (error) {
    console.error('Feature fetch failed:', error)
    return new Map()
  }
}

/**
 * Activate a premium feature for a company (after payment)
 */
export async function activateFeature(
  companyId: bigint,
  featureKey: string,
  userId: bigint,
  activatedVia: 'upgrade_flow' | 'trial' | 'enterprise_grant' = 'upgrade_flow'
): Promise<boolean> {
  try {
    await sql`
      INSERT INTO feature_activations (
        company_id, feature_id, activated_by_user_id, activated_via
      )
      SELECT ${companyId}, pf.id, ${userId}, ${activatedVia}
      FROM premium_features pf
      WHERE pf.feature_key = ${featureKey}
      ON CONFLICT (company_id, feature_id) DO UPDATE SET
        deactivated_at = NULL,
        activated_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error('Feature activation failed:', error)
    return false
  }
}

/**
 * Get feature activation status for a company
 */
export async function getFeatureActivations(
  companyId: bigint
): Promise<Map<string, boolean>> {
  try {
    const activations = await sql`
      SELECT pf.feature_key, fa.deactivated_at
      FROM premium_features pf
      LEFT JOIN feature_activations fa ON pf.id = fa.feature_id AND fa.company_id = ${companyId}
      ORDER BY pf.display_name
    `

    const map = new Map<string, boolean>()
    for (const row of activations as any[]) {
      map.set(row.feature_key, row.deactivated_at === null)
    }
    return map
  } catch (error) {
    console.error('Activation fetch failed:', error)
    return new Map()
  }
}

/**
 * Format price for display
 */
export function formatPrice(cents: number, format: 'monthly' | 'annual' = 'monthly'): string {
  const dollars = cents / 100
  const suffix = format === 'annual' ? '/year' : '/month'
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 0 })}${suffix}`
}
