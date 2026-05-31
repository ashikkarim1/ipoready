import { User } from '@/types'
import { UserPlan } from '@/store/app-store'
import { sql } from '@/lib/db'

export type Feature = 'view' | 'edit' | 'scenario' | 'csv_import' | 'integrations' | 'investor_portal' | 'signing'
export type CapTableFeature = 'edit_cap_table' | 'create_scenario' | 'import_csv' | Feature

interface FeatureAccess {
  free: Feature[]
  starter: Feature[]
  growth: Feature[]
  enterprise: Feature[]
  trial: Feature[] // Growth-level access for 14 days
}

const FEATURE_MATRIX: FeatureAccess = {
  free: ['view'],
  starter: ['view', 'edit'],
  growth: ['view', 'edit', 'scenario', 'csv_import', 'integrations', 'investor_portal', 'signing'],
  enterprise: ['view', 'edit', 'scenario', 'csv_import', 'integrations', 'investor_portal', 'signing'],
  trial: ['view', 'edit', 'scenario', 'csv_import', 'integrations', 'investor_portal', 'signing'], // Full access
}

const FEATURE_MESSAGES: Record<Feature, string> = {
  view: 'View cap table',
  edit: 'Edit cap table and manage shareholders',
  scenario: 'Create unlimited scenarios and model dilution',
  csv_import: 'Import cap table from CSV',
  integrations: 'Connect with accounting software and investor platforms',
  investor_portal: 'Enable investor access and reporting',
  signing: 'Digital signature and document signing',
}

const UPGRADE_MESSAGES: Record<Feature, Record<UserPlan, string>> = {
  view: {
    free: 'All plans include cap table viewing',
    starter: 'All plans include cap table viewing',
    growth: 'All plans include cap table viewing',
    enterprise: 'All plans include cap table viewing',
    trial: 'All plans include cap table viewing',
  },
  edit: {
    free: 'Upgrade to Starter ($99/mo) to edit your cap table',
    starter: 'Starter plan includes editing',
    growth: 'Starter plan and above include editing',
    enterprise: 'Enterprise plan includes editing',
    trial: 'Trial includes full editing capabilities',
  },
  scenario: {
    free: 'Upgrade to Growth ($299/mo) to create unlimited scenarios',
    starter: 'Upgrade to Growth ($299/mo) to create unlimited scenarios',
    growth: 'Growth plan includes scenario modeling',
    enterprise: 'Enterprise plan includes scenario modeling',
    trial: 'Trial includes unlimited scenarios',
  },
  csv_import: {
    free: 'Upgrade to Growth ($299/mo) to import cap tables',
    starter: 'Upgrade to Growth ($299/mo) to import cap tables',
    growth: 'Growth plan includes CSV import',
    enterprise: 'Enterprise plan includes CSV import',
    trial: 'Trial includes CSV import',
  },
  integrations: {
    free: 'Upgrade to Growth ($299/mo) to enable integrations',
    starter: 'Upgrade to Growth ($299/mo) to enable integrations',
    growth: 'Growth plan includes integrations',
    enterprise: 'Enterprise plan includes integrations',
    trial: 'Trial includes integrations',
  },
  investor_portal: {
    free: 'Upgrade to Growth ($299/mo) to enable investor portal',
    starter: 'Upgrade to Growth ($299/mo) to enable investor portal',
    growth: 'Growth plan includes investor portal',
    enterprise: 'Enterprise plan includes investor portal',
    trial: 'Trial includes investor portal',
  },
  signing: {
    free: 'Upgrade to Growth ($299/mo) to enable document signing',
    starter: 'Upgrade to Growth ($299/mo) to enable document signing',
    growth: 'Growth plan includes document signing',
    enterprise: 'Enterprise plan includes document signing',
    trial: 'Trial includes document signing',
  },
}

/**
 * Check if a user can access a specific feature based on their plan
 */
export function canAccess(feature: Feature, plan: UserPlan, isTrialActive: boolean = false): boolean {
  // If user has active trial, they get Growth-level access
  if (isTrialActive && plan === 'trial') {
    return FEATURE_MATRIX.trial.includes(feature)
  }

  // Map plan to features
  const planKey = plan === 'trial' ? 'growth' : (plan as keyof FeatureAccess)
  return FEATURE_MATRIX[planKey]?.includes(feature) ?? false
}

/**
 * Get a user-friendly message explaining feature access
 */
export function getFeatureMessage(feature: Feature, plan: UserPlan): string {
  return FEATURE_MESSAGES[feature] || 'Feature'
}

/**
 * Get an upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: Feature, currentPlan: UserPlan): string {
  return UPGRADE_MESSAGES[feature]?.[currentPlan] || 'Upgrade your plan to access this feature'
}

/**
 * Get all available features for a plan
 */
export function getAvailableFeatures(plan: UserPlan, isTrialActive: boolean = false): Feature[] {
  if (isTrialActive && plan === 'trial') {
    return FEATURE_MATRIX.trial
  }

  const planKey = plan === 'trial' ? 'growth' : (plan as keyof FeatureAccess)
  return FEATURE_MATRIX[planKey] || []
}

/**
 * Check if a feature is locked (not available in current plan)
 */
export function isFeatureLocked(feature: Feature, plan: UserPlan, isTrialActive: boolean = false): boolean {
  return !canAccess(feature, plan, isTrialActive)
}

/**
 * Get recommended upgrade for a feature
 */
export function getRecommendedUpgrade(feature: Feature, currentPlan: UserPlan): UserPlan {
  if (FEATURE_MATRIX.free.includes(feature)) return 'free'
  if (FEATURE_MATRIX.starter.includes(feature)) return 'starter'
  if (FEATURE_MATRIX.growth.includes(feature)) return 'growth'
  return 'enterprise'
}

/**
 * Check if a company can create a new scenario (based on plan and existing limits)
 */
export async function canCreateScenario(companyId: string): Promise<{ allowed: boolean; message?: string; scenarioLimit?: number }> {
  try {
    // Get company subscription plan
    const company = await sql`
      SELECT subscription_plan FROM companies WHERE id = ${companyId}
    `

    if (!company || company.length === 0) {
      return { allowed: false, message: 'Company not found' }
    }

    const plan = (company[0].subscription_plan || 'free') as UserPlan

    // Check if plan allows scenarios
    if (!FEATURE_MATRIX[plan]?.includes('scenario')) {
      return {
        allowed: false,
        message: 'Your plan does not support creating scenarios. Upgrade to Growth plan to create unlimited scenarios.',
      }
    }

    // Check scenario count limits
    const scenarios = await sql`
      SELECT COUNT(*) as count FROM cap_table_scenarios WHERE company_id = ${companyId}
    `

    const scenarioCount = parseInt(scenarios[0]?.count || '0', 10)
    const limits: Record<UserPlan, number> = {
      free: 0,
      starter: 3,
      growth: 999,
      enterprise: 999,
      trial: 999,
    }

    const limit = limits[plan]
    if (scenarioCount >= limit) {
      return {
        allowed: false,
        message: `You have reached the scenario limit (${limit}) for your plan.`,
        scenarioLimit: limit,
      }
    }

    return { allowed: true, scenarioLimit: limit - scenarioCount }
  } catch (error) {
    console.error('[canCreateScenario] Error:', error)
    return { allowed: false, message: 'Error checking scenario limits' }
  }
}

/**
 * Log feature access attempts for analytics
 */
export async function logFeatureAccess(
  userId: string,
  companyId: string,
  feature: CapTableFeature,
  allowed: boolean,
  ipAddress?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, company_id, action, resource_type, success, ip_address)
      VALUES (${userId}, ${companyId}, 'feature_access', ${feature}, ${allowed}, ${ipAddress || null})
    `
  } catch (error) {
    console.error('[logFeatureAccess] Error:', error)
    // Don't throw - logging failures shouldn't break the request
  }
}
