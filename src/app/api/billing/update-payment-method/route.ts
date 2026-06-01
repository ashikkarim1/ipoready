import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  stripePaymentMethodId: z.string(),
})

/**
 * POST /api/billing/update-payment-method
 * Admin-only endpoint to update company's Stripe default payment method
 * Body: { stripePaymentMethodId }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string; companyId?: string } | undefined

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

  const { stripePaymentMethodId } = body

  try {
    // Get company's Stripe subscription
    const companyRows = await sql`
      SELECT stripe_customer_id, stripe_subscription_id
      FROM companies
      WHERE id = ${user?.companyId}
      LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const company = companyRows[0]

    if (!company.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Company has no Stripe customer configured' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Update customer's default payment method
    await stripe.customers.update(company.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: stripePaymentMethodId,
      },
    })

    // If there's an active subscription, update it too
    if (company.stripe_subscription_id) {
      await stripe.subscriptions.update(company.stripe_subscription_id, {
        default_payment_method: stripePaymentMethodId,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method updated successfully',
      customerId: company.stripe_customer_id,
    })
  } catch (error) {
    console.error('[POST /api/billing/update-payment-method] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment method', details: (error as any).message },
      { status: 500 }
    )
  }
}
