import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  companyId: z.string().uuid().optional(),
})

/**
 * GET /api/trial/status
 * Retrieve trial status for a company
 * Query params: companyId
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const companyId = searchParams.get('companyId') || user?.companyId

  // Validate query params
  try {
    QuerySchema.parse({ companyId })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    )
  }

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  }

  try {
    // Fetch trial data
    const companyRows = await sql`
      SELECT
        id,
        trial_status,
        trial_start_date,
        trial_end_date,
        plan_after_trial,
        subscription_plan,
        subscription_status
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]

    // Calculate trial status
    const now = Date.now()
    const trialEnd = new Date(company.trial_end_date).getTime()
    let status = company.trial_status

    if (status === 'active' && now > trialEnd) {
      status = 'expired'
      // Mark trial as expired in database
      await sql`
        UPDATE companies
        SET trial_status = 'expired'
        WHERE id = ${companyId}
      `
    }

    const daysRemaining = Math.max(
      0,
      Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
    )

    return NextResponse.json({
      companyId: company.id,
      trial: {
        status,
        startDate: company.trial_start_date,
        endDate: company.trial_end_date,
        daysRemaining,
        isActive: status === 'active',
      },
      planAfterTrial: company.plan_after_trial || 'growth',
      subscriptionPlan: company.subscription_plan,
      subscriptionStatus: company.subscription_status,
    })
  } catch (error) {
    console.error('[GET /api/trial/status] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
