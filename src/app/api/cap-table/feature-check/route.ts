/**
 * Cap Table Feature Gate Check Endpoint
 *
 * POST /api/cap-table/feature-check
 * Checks if a user can access a specific cap table feature
 *
 * Request body:
 * {
 *   "feature": "edit_cap_table" | "create_scenario" | "import_csv" | ...
 * }
 *
 * Response:
 * {
 *   "allowed": boolean,
 *   "message": string (if not allowed),
 *   "plan": string,
 *   "scenarioLimit": number (for create_scenario feature)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  canAccess,
  canCreateScenario,
  logFeatureAccess,
  type CapTableFeature,
} from '@/lib/cap-table-feature-gates'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { feature } = await req.json() as {
    feature: CapTableFeature
  }

  if (!feature) {
    return NextResponse.json(
      { error: 'Missing feature parameter' },
      { status: 400 }
    )
  }

  const userId = (session.user as any).id as string
  const companyId = (session.user as any).companyId as string | null
  const ipAddress = req.headers.get('x-forwarded-for') || undefined

  if (!companyId) {
    return NextResponse.json(
      { error: 'No company associated with user' },
      { status: 400 }
    )
  }

  try {
    // Special handling for scenario limits
    if (feature === 'create_scenario') {
      const result = await canCreateScenario(companyId)
      await logFeatureAccess(userId, companyId, feature, result.allowed, ipAddress)
      return NextResponse.json(result)
    }

    // Get company plan for standard feature check
    const company = await sql`
      SELECT subscription_plan, trial_status FROM companies WHERE id = ${companyId}
    `

    if (!company || company.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const plan = (company[0].subscription_plan || 'free') as any
    const isTrialActive = company[0].trial_status === 'active'

    // Map legacy feature names to standard feature names
    const featureMap: Record<string, string> = {
      'edit_cap_table': 'edit',
      'import_csv': 'csv_import',
    }

    const mappedFeature = featureMap[feature] || feature

    // Standard feature check
    const allowed = canAccess(mappedFeature as any, plan, isTrialActive)
    await logFeatureAccess(userId, companyId, feature, allowed, ipAddress)

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Feature not available in your plan',
          plan,
          feature,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      allowed,
      plan,
      message: 'Feature access granted',
    })
  } catch (error) {
    console.error(`[feature-check] Error checking ${feature}:`, error)
    return NextResponse.json(
      { error: 'Error checking feature access' },
      { status: 500 }
    )
  }
}
