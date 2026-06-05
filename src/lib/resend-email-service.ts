/**
 * Email Service - Resend Integration
 * Handles all investor email notifications using configured Resend account
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'alerts@ipoready.ai'

/**
 * Send real-time company alert email to investor
 * Triggered when a company matches investor criteria and launches a raise
 */
export async function sendCompanyAlertEmail(options: {
  investorEmail: string
  investorFirstName: string
  companyName: string
  sector: string
  stage: string
  fundingAmount: number
  fundingType: 'equity' | 'debt' | 'bridge'
  closureTimeline: string
  paceScore: number
  matchScore: number
  location: string
  recentMilestones?: string[]
  profileLink: string
}) {
  const {
    investorEmail,
    investorFirstName,
    companyName,
    sector,
    stage,
    fundingAmount,
    fundingType,
    closureTimeline,
    paceScore,
    matchScore,
    location,
    recentMilestones = [],
    profileLink
  } = options

  const fundingLabel = {
    equity: '💰 Equity Round',
    debt: '📊 Venture Debt',
    bridge: '🌉 Bridge Financing'
  }[fundingType]

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #F7F6F4; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
    .section { padding: 30px; border-bottom: 1px solid #E5E4E0; }
    .company-name { font-size: 24px; font-weight: 700; color: #1A1A1A; margin: 0 0 5px; }
    .company-meta { font-size: 14px; color: #717171; margin: 0; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .badge-equity { background: #EAF5F0; color: #2D7A5F; }
    .badge-debt { background: #EFF6FF; color: #1D4ED8; }
    .badge-bridge { background: #FFFBEB; color: #B45309; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .metric-card { background: #F7F6F4; border-radius: 8px; padding: 15px; border-left: 4px solid #E8312A; }
    .metric-value { font-size: 20px; font-weight: 700; color: #1A1A1A; margin: 0; }
    .metric-label { font-size: 12px; color: #717171; margin: 5px 0 0; font-weight: 600; }
    .match-score { font-size: 32px; font-weight: 700; color: #E8312A; }
    .cta-button { display: inline-block; background: #E8312A; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600; margin: 15px 0; }
    .footer { background: #F7F6F4; padding: 20px 30px; text-align: center; font-size: 12px; color: #717171; }
    .footer a { color: #1D4ED8; text-decoration: none; }
    .milestone { padding: 8px 0; font-size: 14px; color: #1A1A1A; border-bottom: 1px solid #E5E4E0; }
    .milestone:before { content: '✓ '; color: #2D7A5F; font-weight: 700; margin-right: 8px; }
    @media (max-width: 600px) {
      .section { padding: 20px; }
      .header { padding: 30px 20px; }
      .metric-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Deal Alert for ${investorFirstName}</h1>
      <p>${companyName} is raising ${fundingLabel}</p>
    </div>

    <div class="section">
      <p class="company-name">${companyName}</p>
      <p class="company-meta">${sector} • ${location}</p>
      <span class="badge badge-${fundingType}">${stage}</span>
    </div>

    <div class="section">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">$${(fundingAmount / 1000000).toFixed(0)}M</div>
          <div class="metric-label">Fundraising</div>
        </div>
        <div class="metric-card" style="border-left-color: #2D7A5F;">
          <div class="metric-value" style="color: #2D7A5F;">${paceScore}</div>
          <div class="metric-label">PACE Score</div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; background: #F7F6F4; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0; color: #717171; font-size: 12px; font-weight: 600; text-transform: uppercase;">Match Score</p>
        <p class="match-score">${matchScore}%</p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #717171;">Fit to your investment criteria</p>
      </div>
    </div>

    ${
      recentMilestones.length > 0
        ? `
    <div class="section">
      <p style="font-size: 16px; font-weight: 700; color: #1A1A1A; margin: 0 0 15px;">🏆 Recent Milestones</p>
      ${recentMilestones.map((m) => `<div class="milestone">${m}</div>`).join('')}
    </div>
    `
        : ''
    }

    <div class="section">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        <strong>Timeline to Close:</strong> ${closureTimeline}
      </p>
      <a href="${profileLink}" class="cta-button">View Full Company Profile →</a>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px;">
        <a href="https://www.ipoready.ai/investor/dashboard">Manage Alerts</a> •
        <a href="https://www.ipoready.ai/investor/dashboard">Update Criteria</a> •
        <a href="https://www.ipoready.ai/help">Help</a>
      </p>
      <p style="margin: 0; color: #999999; font-size: 11px;">
        © 2026 IPOReady. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: investorEmail,
      subject: `🎯 Alert: ${companyName} is raising $${(fundingAmount / 1000000).toFixed(0)}M`,
      html,
      replyTo: 'investor-support@ipoready.ai'
    })

    return {
      success: true,
      messageId: response.data?.id,
      error: null
    }
  } catch (error) {
    console.error('Error sending company alert email:', error)
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send weekly digest email to investor
 * Summarizes all matching companies from the past week
 */
export async function sendWeeklyDigestEmail(options: {
  investorEmail: string
  investorFirstName: string
  newMatches: number
  totalActive: number
  totalAvailable: number
  companies: Array<{
    name: string
    sector: string
    fundingAmount: number
    fundingType: string
    stage: string
    matchScore: number
  }>
}) {
  const { investorEmail, investorFirstName, newMatches, totalActive, totalAvailable, companies } =
    options

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #F7F6F4; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .section { padding: 30px; border-bottom: 1px solid #E5E4E0; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 0 -10px; }
    .stat-box { text-align: center; padding: 15px; background: #F7F6F4; border-radius: 8px; }
    .stat-number { font-size: 24px; font-weight: 700; color: #E8312A; margin: 0; }
    .stat-label { font-size: 11px; color: #717171; font-weight: 600; text-transform: uppercase; margin: 5px 0 0; }
    .company-card { background: #F7F6F4; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #E8312A; }
    .company-name { font-size: 16px; font-weight: 700; color: #1A1A1A; margin: 0; }
    .company-meta { font-size: 12px; color: #717171; margin: 5px 0 0; }
    .company-match { font-size: 12px; font-weight: 700; color: #E8312A; margin-top: 8px; }
    .cta-button { display: inline-block; background: #E8312A; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600; margin: 15px 0; }
    .footer { background: #F7F6F4; padding: 20px 30px; text-align: center; font-size: 12px; color: #717171; }
    .footer a { color: #1D4ED8; text-decoration: none; }
    @media (max-width: 600px) {
      .section { padding: 20px; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly Investment Digest</h1>
      <p>New opportunities matching your criteria</p>
    </div>

    <div class="section">
      <div class="stats-grid">
        <div class="stat-box">
          <p class="stat-number">${newMatches}</p>
          <p class="stat-label">New This Week</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">${totalActive}</p>
          <p class="stat-label">Active Raises</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">$${totalAvailable}M</p>
          <p class="stat-label">Available</p>
        </div>
      </div>
    </div>

    <div class="section">
      <p style="font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 15px;">Top Opportunities</p>
      ${companies
        .slice(0, 5)
        .map(
          (company) => `
        <div class="company-card">
          <p class="company-name">${company.name}</p>
          <p class="company-meta">
            ${company.sector} • $${(company.fundingAmount / 1000000).toFixed(0)}M ${company.fundingType} • ${company.stage}
          </p>
          <p class="company-match">${company.matchScore}% Match</p>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="section" style="text-align: center;">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        View all opportunities and update your investment criteria.
      </p>
      <a href="https://www.ipoready.ai/investor/dashboard" class="cta-button">Go to Dashboard →</a>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px;">
        <a href="https://www.ipoready.ai/investor/dashboard">Manage Alerts</a> •
        <a href="https://www.ipoready.ai/investor/dashboard">Update Settings</a>
      </p>
      <p style="margin: 0; color: #999999; font-size: 11px;">
        © 2026 IPOReady. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: investorEmail,
      subject: `📊 Weekly Investment Digest - ${newMatches} New Opportunities`,
      html,
      replyTo: 'investor-support@ipoready.ai'
    })

    return {
      success: true,
      messageId: response.data?.id,
      error: null
    }
  } catch (error) {
    console.error('Error sending weekly digest email:', error)
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
