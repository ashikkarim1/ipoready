import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  companyId: z.string().uuid().optional(),
})

/**
 * GET /api/billing/subscription
 * Retrieve subscription status for a company
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
    // Fetch company subscription data
    const companyRows = await sql`
      SELECT 
        id,
        subscription_plan,
        subscription_status,
        stripe_customer_id,
        stripe_subscription_id,
        billing_cycle_start,
        billing_cycle_end,
        trial_start_date,
        trial_end_date,
        trial_status
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]
    const stripe = getStripe()

    let nextBillingDate = company.billing_cycle_end
    let paymentMethod = null

    // If we have a Stripe subscription, get details from Stripe
    if (company.stripe_subscription_id) {
      try {
        const subscription = (await stripe.subscriptions.retrieve(company.stripe_subscription_id)) as any
        if (subscription.current_period_end) {
          nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString()
        }

        // Get payment method
        if (subscription.default_payment_method) {
          const pm = await stripe.paymentMethods.retrieve(
            subscription.default_payment_method as string
          )
          if (pm.card) {
            paymentMethod = {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            }
          }
        }
      } catch (error) {
        console.error('[GET /api/billing/subscription] Stripe retrieval error:', error)
      }
    }

    return NextResponse.json({
      companyId: company.id,
      subscriptionPlan: company.subscription_plan || 'starter',
      subscriptionStatus: company.subscription_status || 'active',
      nextBillingDate,
      paymentMethod,
      trial: {
        status: company.trial_status,
        startDate: company.trial_start_date,
        endDate: company.trial_end_date,
        daysRemaining: company.trial_end_date
          ? Math.ceil((new Date(company.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      },
      billingCycle: {
        start: company.billing_cycle_start,
        end: company.billing_cycle_end,
      },
    })
  } catch (error) {
    console.error('[GET /api/billing/subscription] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
