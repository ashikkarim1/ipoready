/**
 * Investor Email Templates
 * Beautiful, mobile-optimized HTML emails for deal alerts and digests
 */

interface CompanyAlert {
  companyName: string
  sector: string
  stage: string
  fundingAmount: number
  fundingType: 'equity' | 'debt' | 'bridge'
  closureTimeline: string
  useOfFunds: string[]
  paceScore: number
  location: string
  recentMilestones?: string[]
  matchScore: number
  fundingLink?: string
}

interface InvestorInfo {
  firstName: string
  firmName: string
  criteria: {
    sectors: string[]
    stages: string[]
    checkSize: { min: number; max: number }
  }
}

export function generateCompanyAlertEmail(company: CompanyAlert, investor: InvestorInfo): string {
  const fundingTypeLabel = {
    equity: '💰 Equity Round',
    debt: '📊 Venture Debt',
    bridge: '🌉 Bridge Financing'
  }[company.fundingType]

  const fundingAmount = (company.fundingAmount / 1000000).toFixed(0)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #F7F6F4;
      color: #1A1A1A;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .header {
      background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .section {
      padding: 30px;
      border-bottom: 1px solid #E5E4E0;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0 0 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0 0 5px;
    }
    .company-subtitle {
      font-size: 14px;
      color: #717171;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
    .badge-equity {
      background: #EAF5F0;
      color: #2D7A5F;
    }
    .badge-debt {
      background: #EFF6FF;
      color: #1D4ED8;
    }
    .badge-bridge {
      background: #FFFBEB;
      color: #B45309;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .metric-card {
      background: #F7F6F4;
      border-radius: 8px;
      padding: 15px;
      border-left: 4px solid #E8312A;
    }
    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0;
    }
    .metric-label {
      font-size: 12px;
      color: #717171;
      margin: 5px 0 0;
      font-weight: 600;
    }
    .match-score {
      font-size: 32px;
      font-weight: 700;
      color: #E8312A;
    }
    .highlight-box {
      background: #EAF5F0;
      border: 2px solid #2D7A5F;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .highlight-box h3 {
      margin: 0 0 10px;
      color: #2D7A5F;
      font-size: 16px;
      font-weight: 700;
    }
    .highlight-box p {
      margin: 0;
      color: #717171;
      font-size: 14px;
      line-height: 1.6;
    }
    .milestone-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .milestone-list li {
      padding: 8px 0;
      font-size: 14px;
      color: #1A1A1A;
      border-bottom: 1px solid #E5E4E0;
    }
    .milestone-list li:last-child {
      border-bottom: none;
    }
    .milestone-list li:before {
      content: '✓ ';
      color: #2D7A5F;
      font-weight: 700;
      margin-right: 8px;
    }
    .cta-button {
      display: inline-block;
      background: #E8312A;
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      text-decoration: none;
      font-weight: 600;
      margin: 15px 0;
      text-align: center;
    }
    .footer {
      background: #F7F6F4;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #717171;
    }
    .footer a {
      color: #1D4ED8;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .section {
        padding: 20px;
      }
      .metric-grid {
        grid-template-columns: 1fr;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎯 Deal Alert for ${investor.firstName}</h1>
      <p>${company.companyName} is raising ${fundingTypeLabel}</p>
    </div>

    <!-- Company Info -->
    <div class="section">
      <p class="company-name">${company.companyName}</p>
      <p class="company-subtitle">${company.sector} • ${company.location}</p>
      <span class="badge badge-${company.fundingType}">${company.stage}</span>
    </div>

    <!-- Key Metrics -->
    <div class="section">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">$${fundingAmount}M</div>
          <div class="metric-label">Fundraising</div>
        </div>
        <div class="metric-card" style="border-left-color: #2D7A5F;">
          <div class="metric-value" style="color: #2D7A5F;">${company.paceScore}</div>
          <div class="metric-label">PACE Score</div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; background: #F7F6F4; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0; color: #717171; font-size: 12px; font-weight: 600; text-transform: uppercase;">Match Score</p>
        <p class="match-score">${company.matchScore}%</p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #717171;">Fit to your investment criteria</p>
      </div>
    </div>

    <!-- Use of Funds -->
    <div class="section">
      <div class="section-title">📊 Use of Capital</div>
      <ul class="milestone-list">
        ${company.useOfFunds.map((use) => `<li>${use}</li>`).join('')}
      </ul>
    </div>

    <!-- Recent Milestones -->
    ${
      company.recentMilestones && company.recentMilestones.length > 0
        ? `
    <div class="section">
      <div class="section-title">🏆 Recent Milestones</div>
      <ul class="milestone-list">
        ${company.recentMilestones.map((milestone) => `<li>${milestone}</li>`).join('')}
      </ul>
    </div>
    `
        : ''
    }

    <!-- Why This Match -->
    <div class="section">
      <div class="highlight-box">
        <h3>Why You're Seeing This</h3>
        <p>
          ${company.companyName} matches your investment criteria:
          <strong>${investor.criteria.sectors.join(', ')}</strong> stage
          <strong>${investor.criteria.stages.join(', ')}</strong> companies,
          and their $${fundingAmount}M raise fits your check size.
        </p>
      </div>
    </div>

    <!-- CTA -->
    <div class="section" style="text-align: center;">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        Get the full company profile, financials, PACE score, and more.
      </p>
      <a href="${company.fundingLink || 'https://www.ipoready.ai/investor/dashboard'}" class="cta-button">
        View Full Company Profile →
      </a>
    </div>

    <!-- Footer -->
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
}

export function generateWeeklyDigestEmail(
  investor: InvestorInfo,
  companies: CompanyAlert[],
  stats: {
    newMatches: number
    totalActive: number
    totalAvailable: number
  }
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #F7F6F4;
      color: #1A1A1A;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .header {
      background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .section {
      padding: 30px;
      border-bottom: 1px solid #E5E4E0;
    }
    .section:last-child {
      border-bottom: none;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin: 0 -10px;
    }
    .stat-box {
      text-align: center;
      padding: 15px;
      background: #F7F6F4;
      border-radius: 8px;
    }
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #E8312A;
      margin: 0;
    }
    .stat-label {
      font-size: 11px;
      color: #717171;
      font-weight: 600;
      text-transform: uppercase;
      margin: 5px 0 0;
    }
    .company-card {
      background: #F7F6F4;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #E8312A;
    }
    .company-name {
      font-size: 16px;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0;
    }
    .company-meta {
      font-size: 12px;
      color: #717171;
      margin: 5px 0 0;
    }
    .company-match {
      font-size: 12px;
      font-weight: 700;
      color: #E8312A;
      margin-top: 8px;
    }
    .footer {
      background: #F7F6F4;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #717171;
    }
    .footer a {
      color: #1D4ED8;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .section {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📊 Weekly Investment Digest</h1>
      <p>New opportunities matching your criteria</p>
    </div>

    <!-- Stats -->
    <div class="section">
      <div class="stats-grid">
        <div class="stat-box">
          <p class="stat-number">${stats.newMatches}</p>
          <p class="stat-label">New This Week</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">${stats.totalActive}</p>
          <p class="stat-label">Active Raises</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">$${stats.totalAvailable}M</p>
          <p class="stat-label">Available</p>
        </div>
      </div>
    </div>

    <!-- Companies -->
    <div class="section">
      <p style="font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 15px;">Top Opportunities</p>
      ${companies
        .slice(0, 5)
        .map(
          (company) => `
        <div class="company-card">
          <p class="company-name">${company.companyName}</p>
          <p class="company-meta">
            ${company.sector} • $${(company.fundingAmount / 1000000).toFixed(0)}M ${company.fundingType} • ${company.stage}
          </p>
          <p class="company-match">
            ${company.matchScore}% Match
          </p>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- CTA -->
    <div class="section" style="text-align: center;">
      <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 15px;">
        View all opportunities and update your investment criteria.
      </p>
      <a
        href="https://www.ipoready.ai/investor/dashboard"
        style="display: inline-block; background: #E8312A; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600;"
      >
        Go to Dashboard →
      </a>
    </div>

    <!-- Footer -->
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
}
