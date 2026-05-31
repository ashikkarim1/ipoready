import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import crypto from 'crypto'
import {
  sendPaymentFailureEmail,
  sendSubscriptionRenewalEmail,
  sendSubscriptionCancelledEmail,
} from '@/lib/billing-notifications'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

interface StripeEvent {
  id: string
  type: string
  data: {
    object: {
      id: string
      customer?: string
      subscription?: string
      status?: string
      plan?: {
        id: string
      }
      items?: {
        data: Array<{
          plan: {
            id: string
          }
        }>
      }
      current_period_start?: number
      current_period_end?: number
      amount?: number
      currency?: string
      paid?: boolean
      invoice?: string
      email?: string
    }
  }
}

function verifyStripeWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  const expectedSignature = `t=0,v1=${hash}`
  return signature.includes(`v1=${hash}`)
}

async function logWebhookEvent(
  eventId: string,
  eventType: string,
  customerId: string,
  payload: any,
  status: 'pending' | 'processed' | 'failed' = 'pending',
  errorMessage?: string
) {
  try {
    await sql`
      INSERT INTO webhook_logs (event_id, event_type, stripe_customer_id, payload, status, error_message)
      VALUES (${eventId}, ${eventType}, ${customerId || null}, ${JSON.stringify(payload)}, ${status}, ${errorMessage || null})
      ON CONFLICT (event_id) DO UPDATE SET
        status = ${status},
        error_message = ${errorMessage || null}
    `
  } catch (e) {
    console.error('Failed to log webhook event:', e)
  }
}

async function getCompanyByStripeCustomer(customerId: string) {
  const result = await sql`
    SELECT id, name, email FROM companies WHERE stripe_customer_id = ${customerId} LIMIT 1
  `
  return result[0] as { id: string; name: string; email: string } | undefined
}

async function handleSubscriptionCreated(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer

  if (!customerId) {
    console.warn('No customer ID in subscription event')
    return
  }

  const company = await getCompanyByStripeCustomer(customerId)

  if (!company) {
    console.warn(`Company not found for Stripe customer ${customerId}`)
    return
  }

  // Extract plan from subscription items
  const planId = obj.items?.data?.[0]?.plan?.id
  const planName = planId?.includes('starter')
    ? 'starter'
    : planId?.includes('growth')
      ? 'growth'
      : planId?.includes('enterprise')
        ? 'enterprise'
        : 'growth'

  const currentPeriodStart = new Date(obj.current_period_start! * 1000)
    .toISOString()
    .split('T')[0]
  const currentPeriodEnd = new Date(obj.current_period_end! * 1000)
    .toISOString()
    .split('T')[0]

  await sql`
    UPDATE companies SET
      subscription_id = ${obj.id},
      subscription_status = ${obj.status || 'active'},
      subscription_plan = ${planName},
      current_period_start = ${currentPeriodStart},
      current_period_end = ${currentPeriodEnd},
      next_billing_date = ${currentPeriodEnd},
      trial_status = CASE WHEN trial_status = 'active' THEN 'upgraded' ELSE trial_status END,
      trial_converted_at = CASE WHEN trial_status = 'active' THEN NOW() ELSE trial_converted_at END
    WHERE id = ${company.id}
  `

  await logWebhookEvent(
    event.id,
    event.type,
    customerId,
    event.data.object,
    'processed'
  )

  console.log(`✅ Subscription created for company ${company.id}`)
}

async function handleSubscriptionUpdated(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer

  if (!customerId) {
    console.warn('No customer ID in subscription event')
    return
  }

  const company = await getCompanyByStripeCustomer(customerId)

  if (!company) {
    console.warn(`Company not found for Stripe customer ${customerId}`)
    return
  }

  const planId = obj.items?.data?.[0]?.plan?.id
  const planName = planId?.includes('starter')
    ? 'starter'
    : planId?.includes('growth')
      ? 'growth'
      : planId?.includes('enterprise')
        ? 'enterprise'
        : 'growth'

  const currentPeriodStart = new Date(obj.current_period_start! * 1000)
    .toISOString()
    .split('T')[0]
  const currentPeriodEnd = new Date(obj.current_period_end! * 1000)
    .toISOString()
    .split('T')[0]

  await sql`
    UPDATE companies SET
      subscription_plan = ${planName},
      subscription_status = ${obj.status || 'active'},
      current_period_start = ${currentPeriodStart},
      current_period_end = ${currentPeriodEnd},
      next_billing_date = ${currentPeriodEnd}
    WHERE id = ${company.id}
  `

  await sendSubscriptionRenewalEmail(company.email, company.name, planName, 0)

  await logWebhookEvent(
    event.id,
    event.type,
    customerId,
    event.data.object,
    'processed'
  )

  console.log(`✅ Subscription updated for company ${company.id}`)
}

async function handleSubscriptionDeleted(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer

  if (!customerId) {
    console.warn('No customer ID in subscription event')
    return
  }

  const company = await getCompanyByStripeCustomer(customerId)

  if (!company) {
    console.warn(`Company not found for Stripe customer ${customerId}`)
    return
  }

  await sql`
    UPDATE companies SET
      subscription_status = 'cancelled',
      cancelled_at = NOW()
    WHERE id = ${company.id}
  `

  await sendSubscriptionCancelledEmail(company.email, company.name)

  await logWebhookEvent(
    event.id,
    event.type,
    customerId,
    event.data.object,
    'processed'
  )

  console.log(`✅ Subscription cancelled for company ${company.id}`)
}

async function handlePaymentFailed(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer

  if (!customerId) {
    console.warn('No customer ID in payment event')
    return
  }

  const company = await getCompanyByStripeCustomer(customerId)

  if (!company) {
    console.warn(`Company not found for Stripe customer ${customerId}`)
    return
  }

  await sql`
    UPDATE companies SET
      payment_failure_count = payment_failure_count + 1,
      subscription_status = 'past_due'
    WHERE id = ${company.id}
  `

  // Only send email if not first failure
  const failureCount =
    (
      await sql`SELECT payment_failure_count FROM companies WHERE id = ${company.id}`
    )[0]?.payment_failure_count || 0

  if (failureCount > 1) {
    await sendPaymentFailureEmail(company.email, company.name)
  }

  await logWebhookEvent(
    event.id,
    event.type,
    customerId,
    event.data.object,
    'processed'
  )

  console.log(
    `✅ Payment failure recorded for company ${company.id}, count: ${failureCount}`
  )
}

async function handlePaymentSucceeded(event: StripeEvent) {
  const obj = event.data.object
  const customerId = obj.customer

  if (!customerId) {
    console.warn('No customer ID in payment event')
    return
  }

  const company = await getCompanyByStripeCustomer(customerId)

  if (!company) {
    console.warn(`Company not found for Stripe customer ${customerId}`)
    return
  }

  await sql`
    UPDATE companies SET
      payment_failure_count = 0,
      subscription_status = 'active'
    WHERE id = ${company.id}
  `

  await logWebhookEvent(
    event.id,
    event.type,
    customerId,
    event.data.object,
    'processed'
  )

  console.log(`✅ Payment succeeded for company ${company.id}`)
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  if (!verifyStripeWebhookSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET)) {
    console.error('❌ Invalid Stripe webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody) as StripeEvent

    // Check for duplicate event
    const existing = await sql`
      SELECT id FROM webhook_logs WHERE event_id = ${event.id} LIMIT 1
    `
    if (existing.length > 0) {
      console.log(`⏭️ Event ${event.id} already processed`)
      return NextResponse.json({ received: true })
    }

    const customerId = event.data.object.customer || ''

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event)
        break
      default:
        // Log unhandled events but don't error
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
        await logWebhookEvent(event.id, event.type, customerId, event.data.object, 'processed')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
