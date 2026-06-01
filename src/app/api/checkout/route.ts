import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getStripe, PRICE_IDS } from '@/lib/stripe'

const APP_URL = process.env.NEXTAUTH_URL ?? 'https://ipoready.vercel.app'

export const dynamic = 'force-dynamic'

/**
 * POST /api/checkout
 * Create Stripe checkout session for plan upgrade or trial completion
 * Body: { planId, billing, currency, isTrialUpgrade? }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { planId, billing, currency, isTrialUpgrade } = await req.json() as {
    planId: string
    billing: 'monthly' | 'sixmonth' | 'annual'
    currency: 'USD' | 'CAD'
    isTrialUpgrade?: boolean
  }

  if (!planId || !billing || !currency) {
    return NextResponse.json({ error: 'Missing planId, billing, or currency' }, { status: 400 })
  }

  const priceId = PRICE_IDS[planId]?.[billing]
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price ID configured for ${planId}/${billing}` }, { status: 400 })
  }

  const userId    = (session.user as any).id as string
  const companyId = (session.user as any).companyId as string | null

  const stripe = getStripe()

  // Look up or create Stripe customer
  const rows = await sql`
    SELECT c.stripe_customer_id, u.email, u.name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  ` as any[]
  if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { stripe_customer_id, email, name } = rows[0]

  let customerId = stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId, companyId: companyId ?? '' },
    })
    customerId = customer.id
    if (companyId) {
      await sql`UPDATE companies SET stripe_customer_id = ${customerId} WHERE id = ${companyId}`
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    currency: currency.toLowerCase(),

    // Automatic tax — Stripe Tax calculates US sales tax + Canadian GST/HST/QST
    automatic_tax: { enabled: true },

    // Allow B2B customers to enter their tax registration number (GST#, EIN, etc.)
    tax_id_collection: { enabled: true },

    // 3-month minimum commitment note in the description
    subscription_data: {
      metadata: {
        userId,
        companyId: companyId ?? '',
        planId,
        billing,
        isTrialUpgrade: isTrialUpgrade ? 'true' : 'false',
      },
      description: `IPOReady ${planId.charAt(0).toUpperCase() + planId.slice(1)} — 3-month minimum commitment`,
    },

    // Pre-fill customer email
    customer_email: customerId ? undefined : email,

    success_url: `${APP_URL}/account?tab=billing&checkout=success`,
    cancel_url:  `${APP_URL}/pricing`,

    metadata: {
      userId,
      companyId: companyId ?? '',
      planId,
      billing,
      isTrialUpgrade: isTrialUpgrade ? 'true' : 'false',
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
