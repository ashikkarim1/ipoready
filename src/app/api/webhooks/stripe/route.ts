import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'
import { getStripe } from '@/lib/stripe'

// Stripe requires raw body for signature verification
export const runtime = 'nodejs'

/**
 * Extract email from company record
 */
async function getCompanyEmail(companyId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT email FROM companies WHERE id = ${companyId} LIMIT 1
    `
    if (result.length > 0) {
      const company = result[0] as any
      return company.email || null
    }
    return null
  } catch (error) {
    console.error('[stripe-webhook] Error fetching company email:', error)
    return null
  }
}

/**
 * Get company by Stripe customer ID
 */
async function getCompanyByStripeCustomerId(
  stripeCustomerId: string
): Promise<{ id: string; email: string | null; name: string } | null> {
  try {
    const result = await sql`
      SELECT id, email, name FROM companies WHERE stripe_customer_id = ${stripeCustomerId} LIMIT 1
    `
    if (result.length > 0) {
      const company = result[0] as any
      return {
        id: company.id,
        email: company.email,
        name: company.name,
      }
    }
    return null
  } catch (error) {
    console.error('[stripe-webhook] Error fetching company by Stripe ID:', error)
    return null
  }
}

/**
 * Handler: customer.subscription.created
 */
async function handleSubscriptionCreated(event: Stripe.CustomerSubscriptionCreatedEvent) {
  const subscription = event.data.object
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const plan = subscription.items.data[0]?.plan
  const priceId = subscription.items.data[0]?.price.id

  // Extract plan name and interval from metadata
  let planName = 'growth'
  let interval = 'monthly'

  if (priceId) {
    // Match priceId to plan name (you may need to adjust based on your Stripe setup)
    if (priceId.includes('starter')) planName = 'starter'
    else if (priceId.includes('enterprise')) planName = 'enterprise'
    else planName = 'growth'

    // Extract interval
    if (priceId.includes('annual') || subscription.items.data[0]?.plan.interval === 'year') {
      interval = 'annual'
    } else if (priceId.includes('sixmonth')) {
      interval = 'sixmonth'
    } else {
      interval = 'monthly'
    }
  }

  const periodStart = new Date((subscription as any).current_period_start * 1000)
  const periodEnd = new Date((subscription as any).current_period_end * 1000)

  // Update companies table
  const company = await getCompanyByStripeCustomerId(customerId)
  if (company) {
    await sql`
      UPDATE companies
      SET
        stripe_customer_id = ${customerId},
        subscription_id = ${subscriptionId},
        subscription_status = 'active',
        subscription_plan = ${planName},
        subscription_interval = ${interval},
        current_period_start = ${periodStart.toISOString().split('T')[0]},
        current_period_end = ${periodEnd.toISOString().split('T')[0]},
        next_billing_date = ${periodEnd.toISOString().split('T')[0]}
      WHERE id = ${company.id}
    `

    // Send welcome email
    if (company.email) {
      try {
        await sendEmail({
          to: company.email,
          templateId: 'plan-upgrade',
          variables: {
            companyName: company.name,
            planName,
            interval,
            periodEnd: periodEnd.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          },
          companyId: company.id,
        })
      } catch (emailErr) {
        console.error(
          '[stripe-webhook] Failed to send subscription email:',
          emailErr instanceof Error ? emailErr.message : String(emailErr)
        )
        // Continue - email failure shouldn't break the subscription
      }
    }

    console.log(
      `[stripe-webhook] Subscription created: ${subscriptionId} for company ${company.id}`
    )
  }
}

/**
 * Handler: customer.subscription.updated
 */
async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const subscription = event.data.object
  const previous = event.data.previous_attributes as any
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id
  const priceId = subscription.items.data[0]?.price.id

  // Extract plan name and interval
  let planName = 'growth'
  let interval = 'monthly'

  if (priceId) {
    if (priceId.includes('starter')) planName = 'starter'
    else if (priceId.includes('enterprise')) planName = 'enterprise'
    else planName = 'growth'

    if (priceId.includes('annual') || subscription.items.data[0]?.plan.interval === 'year') {
      interval = 'annual'
    } else if (priceId.includes('sixmonth')) {
      interval = 'sixmonth'
    } else {
      interval = 'monthly'
    }
  }

  const periodStart = new Date((subscription as any).current_period_start * 1000)
  const periodEnd = new Date((subscription as any).current_period_end * 1000)

  const company = await getCompanyByStripeCustomerId(customerId)
  if (company) {
    // Check if plan or interval changed
    const planChanged = previous?.items?.data?.[0]?.price?.id !== priceId
    const intervalChanged = previous?.items?.data?.[0]?.plan?.interval !== subscription.items.data[0]?.plan.interval

    await sql`
      UPDATE companies
      SET
        subscription_plan = ${planName},
        subscription_interval = ${interval},
        current_period_start = ${periodStart.toISOString().split('T')[0]},
        current_period_end = ${periodEnd.toISOString().split('T')[0]},
        next_billing_date = ${periodEnd.toISOString().split('T')[0]}
      WHERE id = ${company.id}
    `

    // Send upgrade email if plan upgraded
    if (planChanged && company.email) {
      const oldPlan = previous?.items?.data?.[0]?.price?.id || 'unknown'
      const planNames: Record<string, string> = {
        starter: 'Starter',
        growth: 'Growth',
        enterprise: 'Enterprise',
      }

      try {
        await sendEmail({
          to: company.email,
          templateId: 'plan-upgrade',
          variables: {
            companyName: company.name,
            planName: planNames[planName],
            oldPlan: planNames[oldPlan] || 'Previous Plan',
            periodEnd: periodEnd.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          },
          companyId: company.id,
        })
      } catch (emailErr) {
        console.error(
          '[stripe-webhook] Failed to send subscription upgraded email:',
          emailErr instanceof Error ? emailErr.message : String(emailErr)
        )
      }

      console.log(
        `[stripe-webhook] Subscription upgraded: ${subscriptionId} to plan ${planName}`
      )
    }

    if (intervalChanged) {
      console.log(
        `[stripe-webhook] Subscription interval updated: ${subscriptionId} to ${interval}`
      )
    }
  }
}

/**
 * Handler: customer.subscription.deleted
 */
async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const subscription = event.data.object
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  const company = await getCompanyByStripeCustomerId(customerId)
  if (company) {
    await sql`
      UPDATE companies
      SET
        subscription_status = 'cancelled',
        subscription_id = NULL,
        cancelled_at = NOW()
      WHERE id = ${company.id}
    `

    // Send cancellation email
    if (company.email) {
      await sendEmail({
        to: company.email,
        templateId: 'plan-upgrade',
        variables: {
          companyName: company.name,
          supportEmail: 'support@ipoready.com',
        },
        companyId: company.id,
        tags: ['billing', 'cancellation'],
      })
    }

    console.log(`[stripe-webhook] Subscription cancelled: ${subscriptionId}`)
  }
}

/**
 * Handler: invoice.payment_failed
 */
async function handlePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
  const invoice = event.data.object
  const customerId = invoice.customer as string
  const invoiceNumber = invoice.number || invoice.id
  const errorMessage = (invoice as any).last_payment_error?.message || 'Payment failed'

  const company = await getCompanyByStripeCustomerId(customerId)
  if (company) {
    // Increment payment failure count
    const result = await sql`
      SELECT payment_failure_count FROM companies WHERE id = ${company.id} LIMIT 1
    `

    const currentCount = result.length > 0 ? ((result[0] as any).payment_failure_count || 0) : 0
    const newCount = currentCount + 1

    await sql`
      UPDATE companies
      SET payment_failure_count = ${newCount}
      WHERE id = ${company.id}
    `

    // Send appropriate email based on retry count
    if (company.email) {
      if (newCount < 3) {
        // Send retry notification
        await sendEmail({
          to: company.email,
          templateId: 'notification-alert',
          variables: {
            companyName: company.name,
            invoiceNumber,
            errorMessage,
            retryCount: newCount,
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
          },
          companyId: company.id,
          tags: ['billing', 'payment_failed'],
        })
      } else {
        // Send urgent email after 3 failures
        await sendEmail({
          to: company.email,
          templateId: 'notification-alert',
          variables: {
            companyName: company.name,
            invoiceNumber,
            failureCount: newCount,
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
            supportEmail: 'support@ipoready.com',
          },
          companyId: company.id,
          tags: ['billing', 'payment_failed', 'urgent'],
        })
      }
    }

    console.log(
      `[stripe-webhook] Payment failed for invoice ${invoiceNumber}, company ${company.id}, attempt ${newCount}`
    )
  }
}

/**
 * Handler: invoice.payment_succeeded
 */
async function handlePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent) {
  const invoice = event.data.object
  const customerId = invoice.customer as string
  const invoiceNumber = invoice.number || invoice.id
  const amountPaid = (invoice.amount_paid || 0) / 100 // Convert from cents
  const currency = invoice.currency?.toUpperCase() || 'USD'
  const paidAt = new Date((invoice as any).paid_at ? (invoice as any).paid_at * 1000 : Date.now())
  const nextBillingDate =
    (invoice as any).next_payment_attempt &&
    new Date((invoice as any).next_payment_attempt * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const company = await getCompanyByStripeCustomerId(customerId)
  if (company) {
    // Reset payment failure count and update last payment date
    await sql`
      UPDATE companies
      SET
        payment_failure_count = 0,
        last_payment_at = ${paidAt.toISOString()}
      WHERE id = ${company.id}
    `

    // Send receipt email
    if (company.email) {
      await sendEmail({
        to: company.email,
        templateId: 'plan-upgrade',
        variables: {
          companyName: company.name,
          invoiceNumber,
          amountPaid: amountPaid.toFixed(2),
          currency,
          paidAt: paidAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          nextBillingDate,
          invoiceUrl: invoice.hosted_invoice_url || undefined,
        },
        companyId: company.id,
        tags: ['billing', 'payment_succeeded'],
      })
    }

    console.log(
      `[stripe-webhook] Payment succeeded for invoice ${invoiceNumber}, amount: ${amountPaid} ${currency}`
    )
  }
}

/**
 * Log webhook event to database
 */
async function logWebhookEvent(
  eventId: string,
  eventType: string,
  customerId: string | null,
  subscriptionId: string | null,
  payload: Record<string, any>,
  status: 'processed' | 'failed' | 'pending',
  errorMessage?: string
) {
  try {
    await sql`
      INSERT INTO webhook_logs (
        event_id,
        event_type,
        stripe_customer_id,
        stripe_subscription_id,
        payload,
        status,
        error_message,
        created_at
      )
      VALUES (
        ${eventId},
        ${eventType},
        ${customerId},
        ${subscriptionId},
        ${JSON.stringify(payload)},
        ${status},
        ${errorMessage || null},
        NOW()
      )
      ON CONFLICT (event_id) DO UPDATE
      SET
        status = ${status},
        error_message = COALESCE(${errorMessage || null}, error_message)
    `
  } catch (error) {
    console.error('[stripe-webhook] Error logging webhook event:', error)
  }
}

/**
 * Check if webhook has already been processed (idempotency)
 */
async function isWebhookProcessed(eventId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM webhook_logs WHERE event_id = ${eventId} LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error('[stripe-webhook] Error checking webhook idempotency:', error)
    return false
  }
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 })
  }

  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Verify signature
    const stripe = getStripe()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, secret)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[stripe-webhook] Signature verification failed:', message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const eventId = event.id
    const eventType = event.type
    const customerId = (event.data.object as any)?.customer || null
    const subscriptionId =
      (event.data.object as any)?.subscription ||
      (event.data.object as any)?.id ||
      null

    // Check idempotency
    const alreadyProcessed = await isWebhookProcessed(eventId)
    if (alreadyProcessed) {
      console.log(`[stripe-webhook] Webhook ${eventId} already processed, skipping`)
      return NextResponse.json({ received: true })
    }

    // Log as pending
    await logWebhookEvent(eventId, eventType, customerId, subscriptionId, event.data.object, 'pending')

    // Handle event
    try {
      switch (eventType) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event as Stripe.CustomerSubscriptionCreatedEvent)
          break

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent)
          break

        case 'invoice.payment_failed':
          await handlePaymentFailed(event as Stripe.InvoicePaymentFailedEvent)
          break

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event as Stripe.InvoicePaymentSucceededEvent)
          break

        default:
          console.log(`[stripe-webhook] Unhandled event type: ${eventType}`)
          break
      }

      // Log as processed
      await logWebhookEvent(eventId, eventType, customerId, subscriptionId, event.data.object, 'processed')

      return NextResponse.json({ received: true, status: 'processed' })
    } catch (handlerError) {
      const errorMessage = handlerError instanceof Error ? handlerError.message : 'Unknown error'
      console.error(`[stripe-webhook] Error handling ${eventType}:`, handlerError)

      // Log as failed
      await logWebhookEvent(eventId, eventType, customerId, subscriptionId, event.data.object, 'failed', errorMessage)

      // Still return 200 to Stripe so they don't retry
      return NextResponse.json({
        received: true,
        status: 'failed',
        error: errorMessage,
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[stripe-webhook] Webhook handler error:', errorMessage)

    // Return 200 so Stripe doesn't keep retrying
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: errorMessage,
    })
  }
}
