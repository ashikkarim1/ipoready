import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  companyId: z.string().uuid(),
  reason: z.string().optional(),
})

/**
 * POST /api/billing/cancel-subscription
 * Admin-only endpoint to cancel a company's Stripe subscription at end of period
 * Body: { companyId, reason? }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string } | undefined

  // Check authorization
  if (!session || !user?.id || !['admin', 'system_admin'].includes(user?.role || '')) {
    return NextResponse.json(
      { error: 'Forbidden — admin access required' },
      { status: 403 }
    )
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

  const { companyId, reason } = body

  try {
    // Fetch company subscription
    const companyRows = await sql`
      SELECT stripe_subscription_id
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]

    if (!company.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Company has no active subscription' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Cancel subscription at end of billing period
    const subscription = await stripe.subscriptions.update(
      company.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    // Update company subscription status
    await sql`
      UPDATE companies
      SET 
        subscription_status = 'cancellation_pending',
        updated_at = NOW()
      WHERE id = ${companyId}
    `

    // Log cancellation reason if provided
    if (reason) {
      await sql`
        INSERT INTO webhook_logs (event_type, company_id, data)
        VALUES ('subscription_cancellation_requested', ${companyId}, ${JSON.stringify({
          reason,
          cancelledAt: new Date().toISOString(),
          cancelledBy: user.id,
        })})
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription scheduled for cancellation at end of billing period',
      cancelAt: new Date(subscription.cancel_at! * 1000).toISOString(),
      subscriptionId: company.stripe_subscription_id,
    })
  } catch (error) {
    console.error('[POST /api/billing/cancel-subscription] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: (error as any).message },
      { status: 500 }
    )
  }
}
