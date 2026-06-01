import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  companyId: z.string().uuid(),
  planAfterTrial: z.enum(['starter', 'growth', 'enterprise']).default('growth'),
})

/**
 * POST /api/trial/init
 * Initialize a 14-day trial for a company
 * Body: { companyId, planAfterTrial ('growth' default) }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string } | undefined

  // Check authorization (admin or company owner)
  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof BodySchema>

  try {
    const json = await req.json()
    body = BodySchema.parse(json)
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { companyId, planAfterTrial } = body

  try {
    // Fetch company to verify it exists
    const companyRows = await sql`
      SELECT id, owner_id FROM companies WHERE id = ${companyId} LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]

    // Verify authorization (admin or owner)
    const isAdmin = user?.role && ['admin', 'system_admin'].includes(user.role)
    if (!isAdmin && company.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden — only admin or company owner can initialize trial' },
        { status: 403 }
      )
    }

    // Calculate trial dates
    const trialStart = new Date()
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days

    // Initialize trial
    const updatedRows = await sql`
      UPDATE companies
      SET
        trial_start_date = ${trialStart.toISOString()},
        trial_end_date = ${trialEnd.toISOString()},
        trial_status = 'active',
        subscription_plan = 'trial',
        plan_after_trial = ${planAfterTrial},
        subscription_status = 'trial_active',
        updated_at = NOW()
      WHERE id = ${companyId}
      RETURNING
        id, trial_start_date, trial_end_date, trial_status, plan_after_trial
    ` as any[]

    const updated = updatedRows[0]

    // Log trial initialization
    await sql`
      INSERT INTO webhook_logs (event_type, company_id, data)
      VALUES (
        'trial_initialized',
        ${companyId},
        ${JSON.stringify({
          trialStartDate: updated.trial_start_date,
          trialEndDate: updated.trial_end_date,
          planAfterTrial: updated.plan_after_trial,
          initializedBy: user.id,
          initializedAt: new Date().toISOString(),
        })}
      )
    `

    const daysRemaining = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      trial: {
        companyId: updated.id,
        startDate: updated.trial_start_date,
        endDate: updated.trial_end_date,
        status: updated.trial_status,
        daysRemaining,
        planAfterTrial: updated.plan_after_trial,
      },
    })
  } catch (error) {
    console.error('[POST /api/trial/init] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
