/**
 * Test endpoint to send demo emails
 * Allows testing email templates without full system
 *
 * Usage: POST /api/test/send-demo-emails?email=ashik@upcapital.ca
 */

import { Resend } from 'resend'
import { FROM_ADDRESS } from '@/lib/resend'

// Mark route as dynamic - no static generation
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const FROM_EMAIL = FROM_ADDRESS || 'IPOReady <hello@ipoready.com>'

    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'ashik@upcapital.ca'

    const results = []

    // ─── TEST 1: Company Alert Email ───────────────────────────────────────
    const companyAlertHtml = `
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
      <h1>🎯 Deal Alert</h1>
      <p>TechVision AI is raising Series B</p>
    </div>

    <div class="section">
      <p class="company-name">TechVision AI</p>
      <p class="company-meta">Enterprise AI • San Francisco, CA</p>
      <span class="badge badge-equity">Series B</span>
    </div>

    <div class="section">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">$50M</div>
          <div class="metric-label">Fundraising</div>
        </div>
        <div class="metric-card" style="border-left-color: #2D7A5F;">
          <div class="metric-value" style="color: #2D7A5F;">78</div>
          <div class="metric-label">PACE Score</div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; background: #F7F6F4; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0; color: #717171; font-size: 12px; font-weight: 600; text-transform: uppercase;">Match Score</p>
        <p class="match-score">92%</p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #717171;">Excellent fit to your investment criteria</p>
      </div>
    </div>

    <div class="section">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        <strong>🏆 Recent Milestones:</strong>
      </p>
      <div class="milestone">Reached $40M ARR with 150% NRR</div>
      <div class="milestone">Expanded to 5 new enterprise verticals</div>
      <div class="milestone">Hired VP Sales from Databricks</div>
    </div>

    <div class="section">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        <strong>Timeline to Close:</strong> 45-60 days
      </p>
      <a href="https://www.ipoready.ai" class="cta-button">View Full Profile →</a>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px;">
        <a href="#">Manage Alerts</a> •
        <a href="#">Update Criteria</a> •
        <a href="#">Help</a>
      </p>
      <p style="margin: 0;">© 2026 IPOReady. Demo Email.</p>
    </div>
  </div>
</body>
</html>
    `

    const companyAlertResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: testEmail,
      subject: '🎯 Alert: TechVision AI is raising $50M Series B',
      html: companyAlertHtml,
      replyTo: 'investor-support@ipoready.ai'
    })

    results.push({
      name: 'Company Alert Email',
      success: !!companyAlertResult.data?.id,
      messageId: companyAlertResult.data?.id,
      email: testEmail
    })

    // ─── TEST 2: Weekly Digest Email ───────────────────────────────────────
    const weeklyDigestHtml = `
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
          <p class="stat-number">8</p>
          <p class="stat-label">New This Week</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">23</p>
          <p class="stat-label">Active Raises</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">$850M</p>
          <p class="stat-label">Available</p>
        </div>
      </div>
    </div>

    <div class="section">
      <p style="font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 15px;">Top 3 Opportunities</p>

      <div class="company-card">
        <p class="company-name">TechVision AI</p>
        <p class="company-meta">Enterprise AI • $50M equity • Series B</p>
        <p class="company-match">92% Match</p>
      </div>

      <div class="company-card">
        <p class="company-name">CloudScale Inc</p>
        <p class="company-meta">Cloud Infrastructure • $75M equity • Series C</p>
        <p class="company-match">88% Match</p>
      </div>

      <div class="company-card">
        <p class="company-name">FinanceFlow</p>
        <p class="company-meta">FinTech • $35M debt • Growth</p>
        <p class="company-match">85% Match</p>
      </div>
    </div>

    <div class="section" style="text-align: center;">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        View all opportunities and update your investment criteria.
      </p>
      <a href="https://www.ipoready.ai/investor/dashboard" class="cta-button">Go to Dashboard →</a>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px;">
        <a href="#">Manage Alerts</a> •
        <a href="#">Update Settings</a>
      </p>
      <p style="margin: 0;">© 2026 IPOReady. Demo Email.</p>
    </div>
  </div>
</body>
</html>
    `

    const weeklyDigestResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: testEmail,
      subject: '📊 Weekly Investment Digest - 8 New Opportunities',
      html: weeklyDigestHtml,
      replyTo: 'investor-support@ipoready.ai'
    })

    results.push({
      name: 'Weekly Digest Email',
      success: !!weeklyDigestResult.data?.id,
      messageId: weeklyDigestResult.data?.id,
      email: testEmail
    })

    // ─── TEST 3: Outreach Template Email ───────────────────────────────────
    const outreachHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #FFFFFF; }
    .container { max-width: 600px; margin: 0 auto; font-size: 14px; line-height: 1.6; color: #1A1A1A; }
    .header { padding: 20px 0; border-bottom: 1px solid #E5E4E0; margin-bottom: 20px; }
    .header p { margin: 0; font-weight: 700; color: #E8312A; }
    .content { padding: 20px 0; }
    .footer { padding: 20px 0; border-top: 1px solid #E5E4E0; margin-top: 20px; font-size: 12px; color: #717171; }
    a { color: #1D4ED8; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>IPOReady Investor Outreach Template</p>
    </div>

    <div class="content">
      <p>Hi [Investor Name],</p>

      <p>I hope this reaches you well. I'm reaching out because [Your Company] aligns closely with your investment thesis, and I think there's a genuine opportunity here.</p>

      <p><strong>Quick snapshot:</strong></p>
      <ul>
        <li>$[X]M ARR with [X]% YoY growth</li>
        <li>[X]% net revenue retention</li>
        <li>Strategic partnerships with [key players]</li>
        <li>PACE Score: [score]/100 — IPO-ready in [timeline]</li>
      </ul>

      <p>What makes this compelling:</p>
      <ol>
        <li>Massive TAM — [market opportunity]</li>
        <li>Defensible moat — [competitive advantage]</li>
        <li>Proven leadership — [team strength]</li>
      </ol>

      <p>We're actively seeking a lead investor who can contribute strategic value beyond capital. Would you be open to a brief 20-minute call next week to explore whether this could be a fit?</p>

      <p><a href="https://www.ipoready.ai">View our IPOReady profile →</a></p>

      <p>Best regards,<br/>
      [Your Name]<br/>
      [Your Title]<br/>
      [Your Company]<br/>
      [Contact Info]</p>
    </div>

    <div class="footer">
      <p>This is a template email sent via IPOReady. No action required.</p>
    </div>
  </div>
</body>
</html>
    `

    const outreachResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: testEmail,
      subject: 'IPOReady: Investor Outreach Template',
      html: outreachHtml,
      replyTo: 'investor-support@ipoready.ai'
    })

    results.push({
      name: 'Outreach Template Email',
      success: !!outreachResult.data?.id,
      messageId: outreachResult.data?.id,
      email: testEmail
    })

    return Response.json({
      success: true,
      message: `Demo emails sent to ${testEmail}`,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error sending demo emails:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
