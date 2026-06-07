/**
 * DAILY DIGEST EMAIL GENERATOR
 *
 * Creates personalized daily briefing emails for IPOReady users
 * Sent every morning at user's preferred time (default 9 AM)
 *
 * Personalizes by:
 * - Role (CEO, CFO, Head of IR)
 * - Company metrics and status
 * - Alerts and opportunities
 * - Competitor activity
 * - Milestones and deadlines
 */

import { sql } from '@/lib/db'

interface DailyDigestData {
  companyId: string
  companyName: string
  userEmail: string
  userName: string
  userRole: string
  currentReadiness: number
  readinessDelta: number
  currentValuation: number
  valuationDelta: number
  percentile: number
  percentileDelta: number
  daysToIPO: number
  marketSentiment: string
  fedRate: number
  fedRateDelta: number
  alerts: any[]
  competitors: any[]
  topActions: string[]
  trendData: any
}

/**
 * MAIN: Generate daily digest HTML email
 */
export function generateDailyDigestHTML(data: DailyDigestData): string {
  const valuationChangePercent = (
    ((data.currentValuation - (data.currentValuation - data.valuationDelta)) / (data.currentValuation - data.valuationDelta)) *
    100
  ).toFixed(1)

  const readinessColor = data.currentReadiness >= 80 ? '#22c55e' : data.currentReadiness >= 70 ? '#f59e0b' : '#ef4444'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #1f2937; color: #fff; padding: 32px 24px; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .hero { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #fff; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
    .hero h2 { font-size: 18px; margin-bottom: 12px; }
    .hero p { font-size: 14px; opacity: 0.95; line-height: 1.6; }
    .metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .metric { background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .metric-label { font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase; margin-bottom: 8px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .metric-change { font-size: 13px; margin-top: 8px; }
    .metric-change.positive { color: #16a34a; }
    .metric-change.negative { color: #dc2626; }
    .metric-change.neutral { color: #6b7280; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px; }
    .alert-box { padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid; }
    .alert-critical { background: #fee2e2; border-left-color: #dc2626; }
    .alert-warning { background: #fef3c7; border-left-color: #f59e0b; }
    .alert-info { background: #dbeafe; border-left-color: #3b82f6; }
    .alert-opportunity { background: #f0fdf4; border-left-color: #22c55e; }
    .alert-title { font-weight: 600; margin-bottom: 4px; }
    .alert-description { font-size: 13px; line-height: 1.4; }
    .action-item { background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 8px; font-size: 14px; border-left: 3px solid #ef4444; }
    .action-item input { margin-right: 8px; }
    .competitor { background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #3b82f6; }
    .competitor-name { font-weight: 600; }
    .competitor-detail { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .insight { background: #dbeafe; padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 24px; }
    .insight-title { font-weight: 600; color: #1e40af; margin-bottom: 8px; }
    .insight-text { font-size: 14px; color: #1e3a8a; line-height: 1.6; }
    .cta { display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 12px; }
    .footer { background: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>☀️ Market Advantage Daily Brief</h1>
      <p>Your IPO in ${data.daysToIPO} Days • ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Hero Section -->
      <div class="hero">
        <h2>IPO Readiness: ${data.currentReadiness}/100</h2>
        <p>
          ${data.readinessDelta > 0 ? `✅ +${data.readinessDelta} from yesterday` : data.readinessDelta < 0 ? `⚠️ ${data.readinessDelta} from yesterday` : '➡️ Stable from yesterday'}
          ${data.currentReadiness >= 80 ? ' — Ready to accelerate!' : data.currentReadiness >= 70 ? ' — On track, fine-tuning needed' : ' — Build for 12-18 months'}
        </p>
      </div>

      <!-- Key Metrics -->
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Valuation (90d)</div>
          <div class="metric-value">$${data.currentValuation.toFixed(1)}B</div>
          <div class="metric-change ${data.valuationDelta > 0 ? 'positive' : data.valuationDelta < 0 ? 'negative' : 'neutral'}">
            ${data.valuationDelta > 0 ? '📈 +' : data.valuationDelta < 0 ? '📉 ' : '➡️ '}${valuationChangePercent}%
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Market Window</div>
          <div class="metric-value">${data.daysToIPO}d</div>
          <div class="metric-change ${data.daysToIPO > 180 ? 'positive' : data.daysToIPO > 90 ? 'neutral' : 'negative'}">
            ${data.daysToIPO > 180 ? '✅ Wide open' : data.daysToIPO > 90 ? '⏰ Narrowing' : '🔴 Closing!'}
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Peer Rank</div>
          <div class="metric-value">${data.percentile}th</div>
          <div class="metric-change ${data.percentileDelta > 0 ? 'positive' : data.percentileDelta < 0 ? 'negative' : 'neutral'}">
            ${data.percentileDelta > 0 ? '📈 +' : data.percentileDelta < 0 ? '📉 ' : '➡️ '}${Math.abs(data.percentileDelta)} peers
          </div>
        </div>
      </div>

      <!-- What Changed Overnight -->
      ${data.alerts.length > 0 ? `
        <div class="section">
          <div class="section-title">🚨 What Changed Overnight</div>
          ${data.alerts.map((alert, i) => generateAlertHTML(alert)).join('')}
        </div>
      ` : ''}

      <!-- Market Context (for CFO/Finance roles) -->
      ${data.userRole === 'cfo' || data.userRole === 'all-stakeholders' ? `
        <div class="section">
          <div class="section-title">📊 Market Context</div>
          <div class="metric">
            <div class="metric-label">Fed Funds Rate</div>
            <div class="metric-value">${data.fedRate.toFixed(2)}%</div>
            <div class="metric-change ${data.fedRateDelta < 0 ? 'positive' : 'negative'}">
              ${data.fedRateDelta < 0 ? '📉' : '📈'} ${Math.abs(data.fedRateDelta).toFixed(2)}% ${data.fedRateDelta < 0 ? 'down (positive)' : 'up (headwind)'}
            </div>
          </div>
          <p style="font-size: 13px; color: #6b7280; margin-top: 12px;">
            Fed rate changes impact SaaS valuation multiples. A 100bps cut typically increases valuations 8-10%.
          </p>
        </div>
      ` : ''}

      <!-- Competitor Activity -->
      ${data.competitors.length > 0 ? `
        <div class="section">
          <div class="section-title">🏆 Competitor Activity</div>
          ${data.competitors.map(c => generateCompetitorHTML(c)).join('')}
        </div>
      ` : ''}

      <!-- Today's Actions -->
      <div class="section">
        <div class="section-title">✅ Today's Actions</div>
        <div style="background: #f9fafb; padding: 16px; border-radius: 6px;">
          ${data.topActions.map((action, i) => `
            <div class="action-item">
              <strong>${i + 1}.</strong> ${action}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Insight -->
      <div class="insight">
        <div class="insight-title">💡 Strategic Insight</div>
        <div class="insight-text">
          ${generateInsight(data)}
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align: center;">
        <a href="https://app.ipoready.ai/dashboard/market-advantage-pre-ipo" class="cta">View Full Dashboard</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>IPOReady Daily Brief • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })} ET</p>
      <p style="margin-top: 8px; color: #9ca3af;">You're receiving this because you have a Professional or Enterprise IPOReady subscription.</p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * HELPER: Generate alert HTML
 */
function generateAlertHTML(alert: any): string {
  const levelClass = alert.level.includes('CRITICAL')
    ? 'alert-critical'
    : alert.level.includes('WARNING')
      ? 'alert-warning'
      : alert.level.includes('INFO')
        ? 'alert-info'
        : 'alert-opportunity'

  return `
    <div class="alert-box ${levelClass}">
      <div class="alert-title">${alert.level} ${alert.title}</div>
      <div class="alert-description">${alert.description}</div>
      <div style="font-size: 12px; margin-top: 8px; font-weight: 500;">
        ➜ ${alert.recommendation}
      </div>
    </div>
  `
}

/**
 * HELPER: Generate competitor HTML
 */
function generateCompetitorHTML(competitor: any): string {
  return `
    <div class="competitor">
      <div class="competitor-name">${competitor.name}</div>
      <div class="competitor-detail">
        Filed S-1 ${competitor.daysAgo} days ago • Growth ${competitor.growthRate}% • Position: ${competitor.position}
      </div>
    </div>
  `
}

/**
 * HELPER: Generate strategic insight based on data
 */
function generateInsight(data: DailyDigestData): string {
  if (data.readinessDelta > 5) {
    return `Great momentum! Your readiness improved ${data.readinessDelta} points. At this pace, you could reach 80/100 in ${Math.ceil((80 - data.currentReadiness) / (data.readinessDelta || 1))} days.`
  }

  if (data.currentReadiness >= 80 && data.daysToIPO <= 120) {
    return `You're in the optimal window! Your readiness is 80+ and market window is open. Consider filing prospectus in the next 30 days.`
  }

  if (data.daysToIPO <= 60) {
    return `Your market window is closing rapidly (${data.daysToIPO} days remaining). Finalize board prep and legal review immediately.`
  }

  if (data.percentileDelta > 2) {
    return `You're climbing the peer rankings! Moving from ${data.percentile - data.percentileDelta}th to ${data.percentile}th percentile shows strong execution.`
  }

  return `Stay focused on the gaps preventing you from reaching 80/100 readiness. Your biggest opportunities are in ${identifyTopGap(data)}.`
}

/**
 * HELPER: Identify top gap for improvement
 */
function identifyTopGap(data: DailyDigestData): string {
  // Simplified - would parse readiness breakdown
  return 'operating margins and unit economics'
}

/**
 * BATCH: Generate and send daily digests for all companies
 */
export async function sendAllDailyDigests(): Promise<{ sent: number; failed: number }> {
  console.log('📧 Generating daily digests...')

  const recipients = await sql`
    SELECT DISTINCT
      c.id as company_id,
      c.name as company_name,
      u.email,
      u.name,
      u.role,
      es.recipient_role,
      es.email_enabled,
      es.email_time,
      es.email_timezone
    FROM companies c
    JOIN users u ON u.company_id = c.id
    JOIN market_advantage_email_settings es ON es.user_id = u.id
    WHERE es.email_enabled = true
    AND c.subscription_plan IN ('professional', 'enterprise')
  `

  let sent = 0
  let failed = 0

  for (const recipient of recipients) {
    try {
      // Check if it's the right time for this user
      if (!shouldSendNow(recipient.email_time, recipient.email_timezone)) {
        continue
      }

      // Fetch daily digest data
      const digestData = await fetchDigestData(
        recipient.company_id,
        recipient.company_name,
        recipient.email,
        recipient.name,
        recipient.recipient_role || recipient.role
      )

      // Generate HTML
      const html = generateDailyDigestHTML(digestData)

      // Send email (via SendGrid or similar)
      await sendEmail({
        to: recipient.email,
        subject: `☀️ Market Advantage Daily Brief — ${digestData.currentReadiness}/100 Readiness`,
        html,
      })

      sent++

      // Track send in database
      await sql`
        UPDATE market_advantage_email_settings
        SET last_email_sent_at = now()
        WHERE user_id = ${recipient.user_id}
      `
    } catch (error) {
      console.error(`Failed to send digest to ${recipient.email}:`, error)
      failed++
    }
  }

  console.log(`📧 Digests sent: ${sent}, failed: ${failed}`)
  return { sent, failed }
}

/**
 * HELPER: Check if it's the right time to send
 */
function shouldSendNow(emailTime: string, timezone: string): boolean {
  // Simplified - would check user's local time
  // For now, assume sending at 9 AM UTC
  const now = new Date()
  const hour = now.getUTCHours()
  return hour === 13 // 1 PM UTC = 9 AM ET
}

/**
 * HELPER: Fetch all digest data for a company
 */
async function fetchDigestData(
  companyId: string,
  companyName: string,
  userEmail: string,
  userName: string,
  userRole: string
): Promise<DailyDigestData> {
  // Simplified - would fetch all data from various tables
  return {
    companyId,
    companyName,
    userEmail,
    userName,
    userRole,
    currentReadiness: 79,
    readinessDelta: 1,
    currentValuation: 1.51,
    valuationDelta: 0.09,
    percentile: 61,
    percentileDelta: 1,
    daysToIPO: 174,
    marketSentiment: 'bullish',
    fedRate: 4.08,
    fedRateDelta: -0.25,
    alerts: [],
    competitors: [],
    topActions: [
      'Review Fed rate cut impact on valuation model',
      'Compare vs Canva (competitor S-1)',
      'Confirm Q2 metrics for board meeting',
    ],
    trendData: {},
  }
}

/**
 * HELPER: Send email via SendGrid
 */
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  // In production, would use SendGrid API
  // For now, just log
  console.log(`📧 Sending email to ${to}: ${subject}`)
}
