'use strict'

/**
 * Billing Notifications
 * Email notifications for subscription, payment, and trial events
 */

import { sql } from '@/lib/db'
import { sendEmailWithRetry } from '@/lib/email-service'

interface CompanyData {
  id: string
  email: string
  name: string
  subscription_plan?: string
  subscription_status?: string
  current_period_end?: string | null
  last_payment_at?: string | null
  trial_end_date?: string | null
  trial_plan?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.ipoready.com'
const BRAND_COLOR = '#E8312A'
const LOGO_EMOJI = '🚀'

/**
 * Build email HTML wrapper with IPOReady styling
 */
function buildEmailWrapper(content: string, title: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 0; background-color: #F7F6F4; }
      .container { max-width: 560px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 32px; }
      .logo-box { background-color: #1A1A1A; border-radius: 10px; width: 36px; height: 36px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .logo-text { font-size: 20px; font-weight: 800; color: #1A1A1A; letter-spacing: -0.5px; margin-left: 10px; }
      .card { background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E4E0; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); margin-bottom: 20px; }
      h1 { font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px 0; line-height: 1.3; }
      h2 { font-size: 18px; font-weight: 700; color: #1A1A1A; margin: 24px 0 12px 0; }
      p { font-size: 15px; color: #717171; margin: 0 0 16px 0; line-height: 1.6; }
      .highlight { background-color: #FDECEB; border-left: 4px solid #E8312A; padding: 20px; margin-bottom: 28px; border-radius: 8px; }
      .highlight-message { font-size: 14px; color: #1A1A1A; margin: 0; font-weight: 500; }
      .info-box { background-color: #F7F6F4; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
      .info-row { font-size: 14px; color: #717171; margin-bottom: 12px; display: flex; justify-content: space-between; }
      .info-label { font-weight: 600; color: #1A1A1A; }
      .button { background-color: #1A1A1A; color: #FFFFFF; border-radius: 100px; font-size: 14px; font-weight: 600; padding: 12px 28px; display: inline-block; text-decoration: none; margin: 20px 0; }
      .button-secondary { background-color: #E5E4E0; color: #1A1A1A; }
      .footer { text-align: center; margin-top: 24px; }
      .footer-text { font-size: 12px; color: #B8B7B3; margin: 0; line-height: 1.6; }
      .pref-link { font-size: 12px; color: #717171; text-decoration: none; }
      hr { border: none; border-top: 1px solid #E5E4E0; margin: 28px 0; }
      table { width: 100%; }
      table td { padding: 4px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <table style="margin: 0 auto;">
          <tr>
            <td>
              <div class="logo-box">${LOGO_EMOJI}</div>
            </td>
            <td>
              <span class="logo-text">IPO<span style="color: ${BRAND_COLOR};">Ready</span></span>
            </td>
          </tr>
        </table>
      </div>

      <div class="card">
        ${content}
      </div>

      <div class="footer">
        <p class="footer-text">
          IPOReady · hello@ipoready.com<br>
          <a href="${BASE_URL}/billing/preferences" class="pref-link">Manage notification preferences</a><br>
          IPOReady is a workflow platform and does not provide legal, securities or financial advice.
        </p>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(companyId: string, amount: number): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name, subscription_plan FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]
    const amountFormatted = (amount / 100).toFixed(2)

    const content = `
      <h1>Payment failed</h1>
      <p>Hi ${company.name},</p>
      <p>We tried to charge your account for your IPOReady subscription, but the payment failed.</p>

      <div class="highlight">
        <p class="highlight-message">Your payment of $${amountFormatted} USD could not be processed.</p>
      </div>

      <h2>What happened?</h2>
      <p>There may be several reasons your payment failed:</p>
      <ul style="color: #717171; font-size: 14px; line-height: 1.8;">
        <li>Your card has expired</li>
        <li>Insufficient funds</li>
        <li>Card issuer declined the transaction</li>
        <li>Billing address mismatch</li>
      </ul>

      <h2>What you need to do</h2>
      <p>Please update your payment method to resume your subscription and avoid service interruption.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span>${company.subscription_plan || 'Growth'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span>$${amountFormatted} USD</span>
        </div>
        <div class="info-row">
          <span class="info-label">Failed at:</span>
          <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <a href="${BASE_URL}/billing/payment-method" class="button">Update payment method →</a>

      <hr>

      <p style="font-size: 13px; color: #717171;">
        If you believe this is an error or need help, please contact our support team at hello@ipoready.com. We're here to help you stay on track with your IPO timeline.
      </p>
    `

    const html = buildEmailWrapper(content, 'Payment Failed')

    await sendEmailWithRetry({
      to: company.email,
      templateId: 'payment-failed' as any,
      variables: {
        subject: 'Your subscription payment failed - Update payment method',
        html,
      },
      companyId,
      tags: ['billing', 'payment-failed'],
    })

    console.log(`[billing-notifications] Sent payment failed email to ${company.email}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Failed to send payment failed email:`, errorMsg)
    throw err
  }
}

/**
 * Send subscription renewed email
 */
export async function sendSubscriptionRenewedEmail(companyId: string, plan: string): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name, current_period_end FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]
    const nextBillingDate = company.current_period_end
      ? new Date(company.current_period_end).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBD'

    // Pricing map (in cents)
    const planPricing: Record<string, number> = {
      starter: 29900,
      growth: 79900,
      enterprise: 249900,
    }
    const amount = planPricing[plan.toLowerCase()] || 79900
    const amountFormatted = (amount / 100).toFixed(2)

    const content = `
      <h1>Subscription renewed</h1>
      <p>Hi ${company.name},</p>
      <p>Your IPOReady subscription has been successfully renewed. Thank you for your continued trust in us!</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span style="text-transform: capitalize;">${plan}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount charged:</span>
          <span>$${amountFormatted} USD</span>
        </div>
        <div class="info-row">
          <span class="info-label">Next billing date:</span>
          <span>${nextBillingDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Renewed on:</span>
          <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <h2>What's included</h2>
      <p>Your ${plan} plan includes:</p>
      <ul style="color: #717171; font-size: 14px; line-height: 1.8;">
        <li>Full access to PACE™ accuracy benchmarking</li>
        <li>IPO readiness timeline and sequencing</li>
        <li>Document tracking and management</li>
        <li>Team collaboration tools</li>
        <li>Priority support</li>
      </ul>

      <a href="${BASE_URL}/dashboard" class="button">Go to dashboard →</a>

      <hr>

      <p style="font-size: 13px; color: #717171;">
        You can manage your subscription, view invoices, or update billing details in your <a href="${BASE_URL}/billing/invoices" style="color: #717171; text-decoration: underline;">account settings</a>.
      </p>
    `

    const html = buildEmailWrapper(content, 'Subscription Renewed')

    await sendEmailWithRetry({
      to: company.email,
      templateId: 'subscription-renewed' as any,
      variables: {
        subject: `Your subscription to ${plan} has been renewed`,
        html,
      },
      companyId,
      tags: ['billing', 'subscription-renewed'],
    })

    console.log(`[billing-notifications] Sent subscription renewed email to ${company.email}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Failed to send subscription renewed email:`, errorMsg)
    throw err
  }
}

/**
 * Send subscription cancelled email
 */
export async function sendSubscriptionCancelledEmail(companyId: string): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name, subscription_plan FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]

    const content = `
      <h1>Subscription cancelled</h1>
      <p>Hi ${company.name},</p>
      <p>Your IPOReady subscription has been cancelled as requested. We're sorry to see you go!</p>

      <div class="highlight">
        <p class="highlight-message">Your access will be disabled at the end of your current billing period.</p>
      </div>

      <h2>Next steps</h2>
      <p>If you cancelled by mistake or would like to discuss your experience, we'd love to hear from you. You can reactivate your subscription anytime from your account settings.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Last plan:</span>
          <span style="text-transform: capitalize;">${company.subscription_plan || 'Growth'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cancelled on:</span>
          <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <h2>We want you back</h2>
      <p>Your data and settings are preserved. If you change your mind, you can reactivate your account and continue exactly where you left off.</p>

      <a href="${BASE_URL}/billing/reactivate" class="button button-secondary">Reactivate subscription</a>

      <hr>

      <p style="font-size: 13px; color: #717171;">
        If you have feedback about your experience with IPOReady, please reach out to hello@ipoready.com. We value your input and would appreciate understanding how we can serve you better.
      </p>
    `

    const html = buildEmailWrapper(content, 'Subscription Cancelled')

    await sendEmailWithRetry({
      to: company.email,
      templateId: 'subscription-cancelled' as any,
      variables: {
        subject: 'Your IPOReady subscription has been cancelled',
        html,
      },
      companyId,
      tags: ['billing', 'subscription-cancelled'],
    })

    console.log(`[billing-notifications] Sent subscription cancelled email to ${company.email}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Failed to send subscription cancelled email:`, errorMsg)
    throw err
  }
}

/**
 * Send trial expiring email (sent 2 days before expiry)
 */
export async function sendTrialExpiringEmail(companyId: string, daysRemaining: number): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name, trial_end_date, trial_plan FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]
    const trialEndDate = company.trial_end_date
      ? new Date(company.trial_end_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBD'

    const planName = company.trial_plan || 'Growth'

    const content = `
      <h1>Your trial expires in ${daysRemaining} days</h1>
      <p>Hi ${company.name},</p>
      <p>Your IPOReady trial is expiring soon. To continue using all the tools to accelerate your IPO readiness, please upgrade to a paid plan.</p>

      <div class="highlight">
        <p class="highlight-message">Trial expires: <strong>${trialEndDate}</strong></p>
      </div>

      <h2>Why you should upgrade</h2>
      <ul style="color: #717171; font-size: 14px; line-height: 1.8;">
        <li><strong>PACE™ Accuracy Benchmarking</strong> – Compare your progress against industry standards</li>
        <li><strong>IPO Timeline Sequencing</strong> – Get predictive analytics on your path to IPO</li>
        <li><strong>Document Tracking</strong> – Centralize all regulatory and audit documents</li>
        <li><strong>Team Collaboration</strong> – Coordinate across CFO, legal, and board</li>
        <li><strong>Dedicated Support</strong> – Access to expert guidance</li>
      </ul>

      <h2>Choose your plan</h2>
      <p>We offer flexible plans designed for companies at every stage:</p>

      <div class="info-box">
        <div style="font-weight: 600; color: #1A1A1A; margin-bottom: 12px;">Starter – $299/month</div>
        <p style="font-size: 13px; color: #717171; margin: 0;">Perfect for early-stage companies</p>
      </div>

      <div class="info-box">
        <div style="font-weight: 600; color: #1A1A1A; margin-bottom: 12px;">Growth – $799/month</div>
        <p style="font-size: 13px; color: #717171; margin: 0;">Most popular for RTO-ready companies</p>
      </div>

      <div class="info-box">
        <div style="font-weight: 600; color: #1A1A1A; margin-bottom: 12px;">Enterprise – Custom pricing</div>
        <p style="font-size: 13px; color: #717171; margin: 0;">For large cap and complex IPOs</p>
      </div>

      <a href="${BASE_URL}/pricing" class="button">View plans & upgrade →</a>

      <hr>

      <p style="font-size: 13px; color: #717171;">
        Questions? Our team is ready to help. Contact hello@ipoready.com or schedule a call with our IPO specialists.
      </p>
    `

    const html = buildEmailWrapper(content, `Trial Expires in ${daysRemaining} Days`)

    await sendEmailWithRetry({
      to: company.email,
      templateId: 'trial-expiring' as any,
      variables: {
        subject: `Your trial expires in ${daysRemaining} days - Upgrade to continue`,
        html,
      },
      companyId,
      tags: ['billing', 'trial-expiring'],
    })

    console.log(`[billing-notifications] Sent trial expiring email to ${company.email}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Failed to send trial expiring email:`, errorMsg)
    throw err
  }
}

/**
 * Send trial expired email (sent when trial ends)
 */
export async function sendTrialExpiredEmail(companyId: string): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]

    const content = `
      <h1>Your trial has ended</h1>
      <p>Hi ${company.name},</p>
      <p>Your 14-day IPOReady trial has expired. Your access to the platform is now limited. To continue using all features and stay on track with your IPO timeline, please upgrade to a paid plan.</p>

      <div class="highlight">
        <p class="highlight-message">Your trial features are no longer available. Upgrade now to restore full access.</p>
      </div>

      <h2>What you'll lose without upgrading</h2>
      <p>Without an active subscription, you'll have limited access to:</p>
      <ul style="color: #717171; font-size: 14px; line-height: 1.8;">
        <li>PACE™ accuracy benchmarking and industry comparisons</li>
        <li>Predictive IPO timeline and milestones</li>
        <li>Document management and tracking</li>
        <li>Team collaboration features</li>
        <li>Advanced reporting and insights</li>
      </ul>

      <h2>Pick a plan</h2>
      <p>All plans come with a 30-day money-back guarantee if you're not satisfied.</p>

      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px; border: 1px solid #E5E4E0; border-radius: 8px;">
            <div style="font-weight: 600; color: #1A1A1A;">Starter</div>
            <div style="font-size: 13px; color: #717171;">$299/month</div>
          </td>
          <td style="padding: 12px; border: 1px solid #E5E4E0; border-radius: 8px;">
            <div style="font-weight: 600; color: #1A1A1A;">Growth</div>
            <div style="font-size: 13px; color: #717171;">$799/month</div>
          </td>
          <td style="padding: 12px; border: 1px solid #E5E4E0; border-radius: 8px;">
            <div style="font-weight: 600; color: #1A1A1A;">Enterprise</div>
            <div style="font-size: 13px; color: #717171;">Custom</div>
          </td>
        </tr>
      </table>

      <a href="${BASE_URL}/billing/upgrade" class="button">Upgrade now →</a>

      <hr>

      <p style="font-size: 13px; color: #717171;">
        Need help choosing the right plan? Our team is available to discuss your specific needs. Reply to this email or contact hello@ipoready.com.
      </p>
    `

    const html = buildEmailWrapper(content, 'Trial Ended')

    await sendEmailWithRetry({
      to: company.email,
      templateId: 'trial-expired' as any,
      variables: {
        subject: 'Your trial has ended - Upgrade to continue',
        html,
      },
      companyId,
      tags: ['billing', 'trial-expired'],
    })

    console.log(`[billing-notifications] Sent trial expired email to ${company.email}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Failed to send trial expired email:`, errorMsg)
    throw err
  }
}

export async function sendPaymentSucceededEmail(
  companyId: string,
  variables: Record<string, any>
): Promise<void> {
  try {
    // Fetch company data
    const companies = (await sql`
      SELECT id, email, name, subscription_plan FROM companies WHERE id = ${companyId}
    `) as CompanyData[]

    if (companies.length === 0) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]
    const amount = variables.amount || '0.00'
    const paidAt = variables.paidAt || new Date().toLocaleDateString('en-US')

    const content = `
      <h1>Payment received</h1>
      <p>Hi ${company.name},</p>
      <p>We've successfully processed your payment for IPOReady. Thank you for keeping your subscription active!</p>

      <div class="highlight">
        <p class="highlight-message">Payment of $${amount} ${variables.currency || 'USD'} received</p>
      </div>

      <h2>Payment details</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Invoice:</span>
          <span>${variables.invoiceId || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span>$${amount} ${variables.currency || 'USD'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span>${company.subscription_plan || 'Growth'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Paid on:</span>
          <span>${paidAt}</span>
        </div>
      </div>

      <p>Your account is all set. You can continue using IPOReady to manage your IPO readiness workflow.</p>

      <a href="${BASE_URL}/billing/invoices" class="button">View invoice →</a>

      <hr>

      <p style="font-size: 13px; color: #717171;">
        Questions about your invoice? You can download a PDF copy from your account dashboard or contact us at hello@ipoready.com.
      </p>
    `

    const html = buildEmailWrapper(content, 'Payment Received')

    await sendEmailWithRetry({
      to: company.email,
      templateId: 'payment-succeeded' as any,
      variables: {
        subject: 'Payment received - Your subscription is active',
        html,
      },
      companyId,
      tags: ['billing', 'payment-succeeded'],
    })

    console.log(`[billing-notifications] Sent payment succeeded email to ${company.email}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Failed to send payment succeeded email:`, errorMsg)
    throw err
  }
}
