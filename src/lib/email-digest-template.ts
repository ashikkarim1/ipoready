export interface DigestMetrics {
  // System Health
  uptime: number // percentage
  apiLatencyP95: number // ms
  errorRate: number // percentage
  activeUsers: number

  // Compliance
  complianceScore: number // 0-100
  documentsValidated: number
  regulatoryChanges: number
  auditItemsResolved: number

  // Performance & Optimization
  hoursOptimizedThisWeek: number
  costSavingsThisWeek: number // USD
  issuesResolvedCount: number
  risksIdentifiedCount: number

  // Team Activity
  documentsProcessed: number
  tasksCompleted: number
  checklistsAdvanced: number
  paceScoresUpdated: number

  // Critical Metrics (below the line)
  blockers: Array<{
    severity: 'critical' | 'high' | 'medium'
    title: string
    description: string
    impact: string
    daysActive: number
  }>
  warnings: Array<{
    title: string
    metric: string
    threshold: string
    current: string
  }>
}

export function generateEmailHTML(metrics: DigestMetrics, teamName: string, period: string): string {
  const green = '#2D7A5F'
  const red = '#E8312A'
  const amber = '#B45309'
  const lightBg = '#F7F6F4'
  const white = '#FFFFFF'
  const textNav = '#1A1A1A'
  const textMuted = '#717171'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: ${lightBg}; }
      .container { max-width: 600px; margin: 0 auto; background: ${white}; }
      .header { background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); color: white; padding: 40px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
      .section { padding: 30px; border-bottom: 1px solid #E5E4E0; }
      .section-title { font-size: 16px; font-weight: 700; color: ${textNav}; margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
      .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .metric-card { background: ${lightBg}; border-radius: 8px; padding: 15px; border-left: 4px solid ${green}; }
      .metric-card.success { border-left-color: ${green}; }
      .metric-card.warning { border-left-color: ${amber}; }
      .metric-card.critical { border-left-color: ${red}; }
      .metric-value { font-size: 24px; font-weight: 700; color: ${textNav}; margin: 0; }
      .metric-label { font-size: 12px; color: ${textMuted}; margin: 5px 0 0; font-weight: 600; }
      .metric-card.critical .metric-value { color: ${red}; }
      .metric-card.warning .metric-value { color: ${amber}; }
      .highlight-box { background: #EAF5F0; border: 2px solid ${green}; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .highlight-box h3 { margin: 0 0 10px; color: ${green}; font-size: 16px; font-weight: 700; }
      .highlight-box p { margin: 0; color: ${textMuted}; font-size: 14px; line-height: 1.6; }
      .blocker { background: #F9E4E1; border-left: 4px solid ${red}; padding: 15px; margin: 10px 0; border-radius: 4px; }
      .blocker h4 { margin: 0 0 5px; color: ${red}; font-size: 14px; font-weight: 700; }
      .blocker p { margin: 5px 0; color: ${textNav}; font-size: 13px; }
      .blocker .impact { font-weight: 600; color: ${textMuted}; font-size: 12px; margin-top: 8px; }
      .footer { background: ${lightBg}; padding: 20px 30px; text-align: center; font-size: 12px; color: ${textMuted}; }
      .footer a { color: #1D4ED8; text-decoration: none; }
      .cta-button { display: inline-block; background: #E8312A; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600; margin: 15px 0; }
      .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #E5E4E0; }
      .stat-row:last-child { border-bottom: none; }
      .stat-label { font-size: 14px; color: ${textNav}; font-weight: 500; }
      .stat-value { font-size: 16px; font-weight: 700; color: ${green}; }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>📊 ${teamName} Team Digest</h1>
        <p>${period}</p>
      </div>

      <!-- Executive Summary -->
      <div class="section">
        <div class="metric-grid">
          <div class="metric-card success">
            <div class="metric-value">${metrics.complianceScore}%</div>
            <div class="metric-label">COMPLIANCE SCORE</div>
          </div>
          <div class="metric-card success">
            <div class="metric-value">${metrics.uptime.toFixed(2)}%</div>
            <div class="metric-label">SYSTEM UPTIME</div>
          </div>
          <div class="metric-card success">
            <div class="metric-value">${metrics.apiLatencyP95}ms</div>
            <div class="metric-label">API P95 LATENCY</div>
          </div>
          <div class="metric-card success">
            <div class="metric-value">${metrics.activeUsers}</div>
            <div class="metric-label">ACTIVE USERS</div>
          </div>
        </div>
      </div>

      <!-- Key Wins -->
      <div class="section">
        <div class="section-title">✨ Key Wins This Week</div>
        <div class="highlight-box">
          <h3>🏆 Hours Optimized: ${metrics.hoursOptimizedThisWeek} hours</h3>
          <p>Your system prevented manual work, automated tasks, and resolved ${metrics.issuesResolvedCount} issues this week.</p>
        </div>
        <div class="highlight-box">
          <h3>💰 Cost Savings: $${metrics.costSavingsThisWeek.toLocaleString()}</h3>
          <p>AWS optimization, efficient data processing, and performance improvements saved costs this period.</p>
        </div>
        <div class="highlight-box">
          <h3>🔒 Compliance: ${metrics.auditItemsResolved} items resolved</h3>
          <p>${metrics.documentsValidated} documents validated against regulatory requirements. Audit score: ${metrics.complianceScore}%</p>
        </div>
      </div>

      <!-- System Health -->
      <div class="section">
        <div class="section-title">⚙️ System Health</div>
        <div class="stat-row">
          <span class="stat-label">Uptime</span>
          <span class="stat-value">${metrics.uptime.toFixed(2)}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">API Latency (p95)</span>
          <span class="stat-value">${metrics.apiLatencyP95}ms</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Error Rate</span>
          <span class="stat-value">${metrics.errorRate.toFixed(3)}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Active Sessions</span>
          <span class="stat-value">${metrics.activeUsers}</span>
        </div>
      </div>

      <!-- Team Activity -->
      <div class="section">
        <div class="section-title">📈 Team Activity</div>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${metrics.documentsProcessed}</div>
            <div class="metric-label">Documents Processed</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.tasksCompleted}</div>
            <div class="metric-label">Tasks Completed</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.checklistsAdvanced}</div>
            <div class="metric-label">Checklists Advanced</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.paceScoresUpdated}</div>
            <div class="metric-label">PACE Scores Updated</div>
          </div>
        </div>
      </div>

      <!-- Regulatory Updates -->
      <div class="section">
        <div class="section-title">🔐 Compliance & Regulatory</div>
        <div class="stat-row">
          <span class="stat-label">Documents Validated</span>
          <span class="stat-value">${metrics.documentsValidated}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Audit Items Resolved</span>
          <span class="stat-value">${metrics.auditItemsResolved}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Regulatory Changes</span>
          <span class="stat-value">${metrics.regulatoryChanges}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Compliance Score</span>
          <span class="stat-value">${metrics.complianceScore}%</span>
        </div>
      </div>

      <!-- Below the Line: Blockers & Risks -->
      ${metrics.blockers.length > 0 || metrics.warnings.length > 0 ? `
      <div class="section">
        <div class="section-title">⚠️ Below the Line: Risks & Issues</div>

        ${metrics.blockers.length > 0 ? `
        <h3 style="color: #1A1A1A; font-size: 14px; margin: 0 0 15px; font-weight: 600;">Critical & High Priority Issues</h3>
        ${metrics.blockers.map(blocker => `
          <div class="blocker">
            <h4>${blocker.severity === 'critical' ? '🔴' : '🟠'} ${blocker.title}</h4>
            <p>${blocker.description}</p>
            <div class="impact">
              <strong>Impact:</strong> ${blocker.impact}<br>
              <strong>Active for:</strong> ${blocker.daysActive} days
            </div>
          </div>
        `).join('')}
        ` : ''}

        ${metrics.warnings.length > 0 ? `
        <h3 style="color: #1A1A1A; font-size: 14px; margin: ${metrics.blockers.length > 0 ? '20px' : '0'} 0 15px; font-weight: 600;">Metric Warnings</h3>
        ${metrics.warnings.map(warning => `
          <div style="background: #FFFBEB; border-left: 4px solid #B45309; padding: 15px; margin: 10px 0; border-radius: 4px;">
            <strong style="color: #B45309;">${warning.title}</strong><br>
            <span style="font-size: 13px; color: #717171;">
              Current: <strong>${warning.current}</strong> | Threshold: <strong>${warning.threshold}</strong>
            </span>
          </div>
        `).join('')}
        ` : ''}
      </div>
      ` : ''}

      <!-- Call to Action -->
      <div class="section" style="text-align: center; background: #EAF5F0;">
        <h2 style="color: #2D7A5F; margin: 0 0 10px; font-size: 16px;">Ready to Take Action?</h2>
        <p style="color: #717171; margin: 0 0 15px; font-size: 14px;">
          Review your dashboard for detailed insights and next steps
        </p>
        <a href="https://www.ipoready.ai/dashboard" class="cta-button">Open Dashboard</a>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 15px;">
          <strong>Next Week's Digest:</strong> ${getNextWeek()}<br>
          <a href="https://www.ipoready.ai/account/email-digest-settings">Manage Digest Settings</a> |
          <a href="https://www.ipoready.ai/help">Help Center</a>
        </p>
        <p style="margin: 0; color: #999999; font-size: 11px;">
          © 2026 IPOReady. All rights reserved. |
          <a href="https://www.ipoready.ai/privacy" style="color: #999999;">Privacy Policy</a>
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

function getNextWeek(): string {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return nextWeek.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}
