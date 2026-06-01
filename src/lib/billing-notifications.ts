'use strict'

/**
 * Billing Notifications Service
 * Transactional emails for subscription lifecycle events using Resend
 */

import { getResend, FROM_ADDRESS } from '@/lib/resend'
import { sql } from '@/lib/db'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ipoready.ai'
const BRAND_COLOR = '#E8312A'

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Build responsive HTML email template with IPOReady branding
 */
function buildEmailTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f7f6f4;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e5e4e0;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
    }
    
    .header {
      background-color: #1a1a1a;
      padding: 32px 40px;
      text-align: center;
      border-bottom: 1px solid #e5e4e0;
    }
    
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      font-size: 28px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      border-radius: 8px;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    
    .logo-text .highlight {
      color: ${BRAND_COLOR};
    }
    
    .content {
      padding: 40px;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 28px 0 16px 0;
    }
    
    p {
      font-size: 15px;
      color: #717171;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    
    .highlight-box {
      background-color: #fdeceb;
      border-left: 4px solid ${BRAND_COLOR};
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    
    .highlight-box p {
      color: #1a1a1a;
      margin: 0;
      font-weight: 500;
      font-size: 14px;
    }
    
    .info-box {
      background-color: #f7f6f4;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #717171;
      margin-bottom: 12px;
    }
    
    .info-row:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .button {
      display: inline-block;
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 12px 28px;
      border-radius: 100px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    
    .button:hover {
      background-color: #2a2a2a;
    }
    
    .button-secondary {
      background-color: #e5e4e0;
      color: #1a1a1a;
    }
    
    .button-secondary:hover {
      background-color: #d5d4d0;
    }
    
    hr {
      border: none;
      border-top: 1px solid #e5e4e0;
      margin: 28px 0;
    }
    
    .footer {
      background-color: #f7f6f4;
      padding: 28px 40px;
      border-top: 1px solid #e5e4e0;
      text-align: center;
      font-size: 12px;
      color: #b8b7b3;
    }
    
    .footer p {
      font-size: 12px;
      color: #b8b7b3;
      margin-bottom: 8px;
    }
    
    .footer a {
      color: #717171;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    ul {
      margin: 16px 0;
      padding-left: 20px;
      color: #717171;
    }
    
    ul li {
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    @media (max-width: 600px) {
      .container {
        border-radius: 0;
        border: none;
      }
      
      .content,
      .footer {
        padding: 24px;
      }
      
      h1 {
        font-size: 20px;
      }
      
      h2 {
        font-size: 16px;
      }
      
      .info-row {
        flex-direction: column;
        margin-bottom: 8px;
      }
      
      .info-label {
        margin-bottom: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">🚀</div>
        <div class="logo-text">IPO<span class="highlight">Ready</span></div>
      </div>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>IPOReady · <a href="mailto:support@ipoready.com">support@ipoready.com</a></p>
      <p><a href="${APP_URL}/billing/preferences">Manage notification preferences</a></p>
      <p>IPOReady is a workflow platform and does not provide legal, securities, or financial advice.</p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Send payment failed email
 * Notifies company when payment attempt fails
 */
export async function sendPaymentFailedEmail(
  companyEmail: string,
  companyName: string,
  invoiceNumber: string,
  errorMessage: string
): Promise<SendEmailResult> {
  try {
    const content = `
      <h1>Action Required: Update Your Payment Method</h1>
      <p>Dear ${companyName},</p>
      <p>We were unable to process your IPOReady subscription payment.</p>
      
      <div class="highlight-box">
        <p>Invoice #${invoiceNumber}</p>
        <p>Error: ${errorMessage}</p>
      </div>
      
      <p>Please update your payment method to keep your subscription active:</p>
      
      <a href="${APP_URL}/billing/update-payment" class="button">Update Payment Method →</a>
      
      <p>If you have any questions, please contact <a href="mailto:support@ipoready.com" style="color: ${BRAND_COLOR}; text-decoration: none;">support@ipoready.com</a></p>
      
      <hr>
      
      <p style="font-size: 13px; color: #717171;">
        Your account may be suspended if payment is not received within 7 days. We're here to help—don't hesitate to reach out.
      </p>
    `

    const html = buildEmailTemplate(content, 'Action Required: Update Your Payment Method')
    const subject = 'Action Required: Update Your Payment Method'

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: companyEmail,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send payment failed email to ${companyEmail}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent payment failed email to ${companyEmail}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending payment failed email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send payment succeeded email
 * Confirms successful payment and shows invoice details
 */
export async function sendPaymentSucceededEmail(
  companyEmail: string,
  companyName: string,
  invoiceNumber: string,
  amount: number,
  paidDate: string,
  nextBillingDate: string
): Promise<SendEmailResult> {
  try {
    const content = `
      <h1>Payment Confirmed - IPOReady Subscription Renewed</h1>
      <p>Dear ${companyName},</p>
      <p>Thank you! Your payment of $${amount.toFixed(2)} has been processed successfully.</p>
      
      <div class="highlight-box">
        <p>Your subscription is active and ready to use.</p>
      </div>
      
      <h2>Invoice Details</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Invoice:</span>
          <span>${invoiceNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span>$${amount.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Date:</span>
          <span>${paidDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Next Billing:</span>
          <span>${nextBillingDate}</span>
        </div>
      </div>
      
      <a href="${APP_URL}/billing/invoices/${invoiceNumber}" class="button">View Invoice →</a>
      
      <p>Your account is all set. You can continue using IPOReady to manage your IPO readiness workflow.</p>
      
      <hr>
      
      <p style="font-size: 13px; color: #717171;">
        Questions about your invoice? You can download a PDF copy from your account dashboard or contact <a href="mailto:support@ipoready.com" style="color: #717171; text-decoration: none;">support@ipoready.com</a>.
      </p>
    `

    const html = buildEmailTemplate(content, 'Payment Confirmed')
    const subject = 'Payment Confirmed - IPOReady Subscription Renewed'

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: companyEmail,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send payment succeeded email to ${companyEmail}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent payment succeeded email to ${companyEmail}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending payment succeeded email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send subscription renewed email
 * Notifies company about successful subscription renewal
 */
export async function sendSubscriptionRenewedEmail(
  companyEmail: string,
  companyName: string,
  planName: string,
  billingInterval: string,
  amount: number,
  nextBillingDate: string
): Promise<SendEmailResult> {
  try {
    const content = `
      <h1>Your IPOReady ${planName} Subscription Renewed</h1>
      <p>Dear ${companyName},</p>
      <p>Your subscription to IPOReady ${planName} has been successfully renewed.</p>
      
      <h2>Subscription Details</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span>${planName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Billing Cycle:</span>
          <span>${billingInterval}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span>$${amount.toFixed(2)}/${billingInterval}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Next Renewal:</span>
          <span>${nextBillingDate}</span>
        </div>
      </div>
      
      <div class="highlight-box">
        <p>Continue your IPO journey with full access to PACE™ scoring, benchmarking, and milestone sequencing.</p>
      </div>
      
      <a href="${APP_URL}/app/pace" class="button">Continue Your IPO Journey →</a>
      
      <p>Your team can continue collaborating on:</p>
      <ul>
        <li>PACE™ accuracy benchmarking and industry comparisons</li>
        <li>Real-time milestone sequencing validation</li>
        <li>Document completeness tracking</li>
        <li>Advanced reporting and insights</li>
        <li>Customizable timeline scenarios</li>
      </ul>
      
      <hr>
      
      <p style="font-size: 13px; color: #717171;">
        Need support? Our team is available at <a href="mailto:support@ipoready.com" style="color: #717171; text-decoration: none;">support@ipoready.com</a>
      </p>
    `

    const html = buildEmailTemplate(content, `Subscription Renewed - ${planName}`)
    const subject = `Your IPOReady ${planName} Subscription Renewed`

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: companyEmail,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send subscription renewed email to ${companyEmail}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent subscription renewed email to ${companyEmail}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending subscription renewed email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send subscription cancelled email
 * Notifies company about subscription cancellation
 */
export async function sendSubscriptionCancelledEmail(
  companyEmail: string,
  companyName: string,
  planName: string,
  cancelledDate: string
): Promise<SendEmailResult> {
  try {
    const content = `
      <h1>Your IPOReady Subscription Has Been Cancelled</h1>
      <p>Dear ${companyName},</p>
      <p>Your IPOReady subscription has been cancelled as requested.</p>
      
      <h2>Cancellation Details</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span>${planName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cancellation Date:</span>
          <span>${cancelledDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data Retention:</span>
          <span>90 days</span>
        </div>
      </div>
      
      <div class="highlight-box">
        <p>Your company data will be retained for 90 days. After that period, it will be permanently deleted.</p>
      </div>
      
      <p>We'd love to have you back! We're constantly improving IPOReady and would appreciate any feedback about your experience.</p>
      
      <a href="${APP_URL}/contact-sales" class="button">Share Your Feedback →</a>
      
      <hr>
      
      <h2>Change Your Mind?</h2>
      <p>If you'd like to reactivate your subscription or have any questions about your cancellation, please reach out to our team at <a href="mailto:support@ipoready.com" style="color: ${BRAND_COLOR}; text-decoration: none;">support@ipoready.com</a>. We're here to help!</p>
      
      <p style="font-size: 13px; color: #717171; margin-top: 28px;">
        If you believe this was sent in error, you can also <a href="${APP_URL}/billing/reactivate" style="color: #717171; text-decoration: none;">reactivate your subscription</a> at any time.
      </p>
    `

    const html = buildEmailTemplate(content, 'Subscription Cancelled')
    const subject = 'Your IPOReady Subscription Has Been Cancelled'

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: companyEmail,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send subscription cancelled email to ${companyEmail}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent subscription cancelled email to ${companyEmail}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending subscription cancelled email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send trial expiring soon email
 * Reminds company their trial is expiring in 2 days
 */
export async function sendTrialExpiringEmail(
  companyEmail: string,
  companyName: string,
  trialEndDate: string
): Promise<SendEmailResult> {
  try {
    const content = `
      <h1>Your IPOReady Trial Expires in 2 Days</h1>
      <p>Dear ${companyName},</p>
      <p>Your 14-day trial of IPOReady expires on <strong>${trialEndDate}</strong>.</p>
      
      <div class="highlight-box">
        <p>Don't miss out! Upgrade now to keep all your data and continue your IPO preparation.</p>
      </div>
      
      <h2>What You'll Get With a Paid Plan</h2>
      <ul>
        <li>Full access to PACE™ scoring and benchmarking</li>
        <li>Real-time milestone sequencing validation</li>
        <li>Document completeness tracking</li>
        <li>Advanced reporting and insights</li>
        <li>Unlimited team collaboration</li>
        <li>Priority support</li>
      </ul>
      
      <a href="${APP_URL}/app/checkout?is_trial_upgrade=true" class="button">Upgrade Now →</a>
      
      <h2>Our Plans</h2>
      <div class="info-box">
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">Starter – $299/month</div>
          <p style="font-size: 13px; color: #717171; margin: 0;">Perfect for early-stage IPO planning</p>
        </div>
      </div>
      
      <div class="info-box">
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">Growth – $799/month</div>
          <p style="font-size: 13px; color: #717171; margin: 0;">Ideal for active IPO preparation</p>
        </div>
      </div>
      
      <div class="info-box">
        <div>
          <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">Enterprise – Custom pricing</div>
          <p style="font-size: 13px; color: #717171; margin: 0;">For large cap and complex IPOs</p>
        </div>
      </div>
      
      <hr>
      
      <p style="font-size: 13px; color: #717171;">
        Questions? Our team is ready to help. Contact <a href="mailto:support@ipoready.com" style="color: #717171; text-decoration: none;">support@ipoready.com</a> or schedule a call with our IPO specialists.
      </p>
    `

    const html = buildEmailTemplate(content, 'Trial Expiring Soon')
    const subject = 'Your IPOReady Trial Expires in 2 Days'

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: companyEmail,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send trial expiring email to ${companyEmail}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent trial expiring email to ${companyEmail}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending trial expiring email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send trial upgraded email
 * Confirms trial upgrade to paid subscription
 */
export async function sendTrialUpgradedEmail(
  companyEmail: string,
  companyName: string,
  planName: string,
  startDate: string,
  amount: number,
  billingInterval: string,
  nextBillingDate: string
): Promise<SendEmailResult> {
  try {
    const content = `
      <h1>Welcome to IPOReady ${planName}!</h1>
      <p>Dear ${companyName},</p>
      <p>Your trial period has ended and your ${planName} subscription is now active!</p>
      
      <h2>Subscription Details</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Plan:</span>
          <span>${planName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Start Date:</span>
          <span>${startDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Billing:</span>
          <span>$${amount.toFixed(2)}/${billingInterval}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Next Renewal:</span>
          <span>${nextBillingDate}</span>
        </div>
      </div>
      
      <div class="highlight-box">
        <p>Your subscription is active and ready to use. All your trial data has been preserved.</p>
      </div>
      
      <a href="${APP_URL}/app/pace" class="button">Get Started →</a>
      
      <h2>What's Included</h2>
      <ul>
        <li>Full PACE™ scoring and benchmarking capabilities</li>
        <li>Real-time milestone sequencing validation</li>
        <li>Document completeness tracking</li>
        <li>Advanced IPO readiness analytics</li>
        <li>Team collaboration tools</li>
        <li>Priority email support</li>
      </ul>
      
      <hr>
      
      <p>Need help getting started? Visit our <a href="${APP_URL}/help" style="color: ${BRAND_COLOR}; text-decoration: none;">help center</a> or email <a href="mailto:support@ipoready.com" style="color: ${BRAND_COLOR}; text-decoration: none;">support@ipoready.com</a> with any questions.</p>
      
      <p style="font-size: 13px; color: #717171; margin-top: 28px;">
        Thank you for choosing IPOReady. We're excited to support your IPO journey!
      </p>
    `

    const html = buildEmailTemplate(content, `Welcome to IPOReady ${planName}`)
    const subject = `Welcome to IPOReady ${planName}!`

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: companyEmail,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send trial upgraded email to ${companyEmail}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent trial upgraded email to ${companyEmail}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending trial upgraded email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Send trial expired email
 * Notifies user that trial has ended and upgrade is needed
 */
export async function sendTrialExpiredEmail(
  companyId: string
): Promise<SendEmailResult> {
  try {
    // Fetch company details
    const companies = await sql`
      SELECT id, email, name
      FROM companies
      WHERE id = ${companyId}
      LIMIT 1
    ` as any[]

    if (!companies.length) {
      throw new Error(`Company not found: ${companyId}`)
    }

    const company = companies[0]
    const subject = `Your IPOReady Trial Has Ended`
    const html = `
      <h1>Trial Period Ended</h1>
      <p>Dear ${company.name},</p>
      <p>Your 14-day trial period for IPOReady has ended.</p>
      <p>To continue using IPOReady and maintain access to your PACE readiness tracking, please upgrade to a paid plan.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/billing" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Upgrade Now
        </a>
      </div>

      <p>If you have any questions, please reach out to our support team.</p>
      <p>Best regards,<br>The IPOReady Team</p>
    `

    const resend = getResend()
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: company.email,
      subject,
      html,
    })

    if (response.error) {
      console.error(
        `[billing-notifications] Failed to send trial expired email to ${company.email}:`,
        response.error
      )
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
      }
    }

    console.log(`[billing-notifications] Sent trial expired email to ${company.email}`)
    return {
      success: true,
      messageId: response.data?.id,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[billing-notifications] Error sending trial expired email: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
    }
  }
}
