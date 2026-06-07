/**
 * ALERT TRIGGER SYSTEM
 *
 * Monitors market conditions and creates alerts when important changes happen
 * Alerts are delivered via:
 * - Dashboard banner (in-app)
 * - Email digest
 * - Push notifications
 * - Slack (optional)
 */

import { sql } from '@/lib/db'

export interface AlertDefinition {
  type: string // 'market-window-closing' | 'fed-rate-change' | etc
  level: '🔴 CRITICAL' | '🟡 WARNING' | '🔵 INFO' | '✨ OPPORTUNITY'
  severity: 1 | 2 | 3 | 4 | 5
  title: string
  description: string
  recommendation: string
  triggerValue: Record<string, any>
}

/**
 * Alert Trigger: Market Window Closing
 *
 * When a company's optimal market window is closing (< 180 days)
 * and they haven't filed yet, create urgency.
 */
export async function checkMarketWindowClosing(
  companyId: string,
  currentReadiness: number,
  daysToTarget: number
): Promise<AlertDefinition | null> {
  if (daysToTarget > 180) return null // Window still wide open

  const urgency =
    daysToTarget <= 60
      ? { level: '🔴 CRITICAL' as const, severity: 5 }
      : daysToTarget <= 120
        ? { level: '🟡 WARNING' as const, severity: 3 }
        : { level: '🔵 INFO' as const, severity: 2 }

  return {
    type: 'market-window-closing',
    level: urgency.level,
    severity: urgency.severity,
    title: `Market Window Closing: ${daysToTarget} Days Remaining`,
    description: `Your optimal IPO window closes in ${daysToTarget} days. Market conditions may shift unfavorably if you delay.`,
    recommendation:
      daysToTarget <= 60
        ? 'File prospectus immediately. Window closing rapidly.'
        : daysToTarget <= 120
          ? 'Accelerate board prep. File within 30 days.'
          : 'Plan to file within 6 months. Window is narrowing.',
    triggerValue: { daysToTarget, readiness: currentReadiness },
  }
}

/**
 * Alert Trigger: Fed Rate Change
 *
 * When Fed funds rate changes by >10 basis points,
 * valuation impact is significant. Alert executives.
 */
export async function checkFedRateChange(
  currentFedRate: number,
  previousFedRate: number,
  companyValuation: number
): Promise<AlertDefinition | null> {
  const fedRateDelta = currentFedRate - previousFedRate
  const deltaBps = Math.abs(fedRateDelta) * 100 // Convert to basis points

  if (deltaBps < 10) return null // Negligible change

  // Fed rate changes affect valuations roughly 10% per 100bps
  const valuationImpact = (deltaBps / 100) * 0.10 * companyValuation
  const direction = fedRateDelta > 0 ? 'increase' : 'decrease'

  return {
    type: 'fed-rate-change',
    level: '🟡 WARNING',
    severity: 3,
    title: `Fed Rate ${direction.charAt(0).toUpperCase() + direction.slice(1)}: ${Math.abs(fedRateDelta).toFixed(2)}%`,
    description: `Fed funds rate ${direction} by ${deltaBps} basis points. This impacts your expected valuation.`,
    recommendation: `Your valuation estimate ${fedRateDelta > 0 ? 'decreased' : 'increased'} by approximately $${Math.abs(valuationImpact).toFixed(1)}M. Update financial forecasts and investor materials.`,
    triggerValue: {
      fedRateDelta,
      currentRate: currentFedRate,
      previousRate: previousFedRate,
      valuationImpact,
    },
  }
}

/**
 * Alert Trigger: Market Sentiment Shift
 *
 * When investor sentiment shifts between tiers
 * (e.g., Neutral → Bullish or Bullish → Bearish)
 */
export async function checkSentimentShift(
  currentSentiment: string,
  previousSentiment: string | null
): Promise<AlertDefinition | null> {
  if (!previousSentiment || currentSentiment === previousSentiment) return null

  const sentimentMap: Record<string, number> = {
    'very-bullish': 5,
    bullish: 4,
    neutral: 3,
    bearish: 2,
    'very-bearish': 1,
  }

  const currentScore = sentimentMap[currentSentiment] || 3
  const previousScore = sentimentMap[previousSentiment] || 3
  const improved = currentScore > previousScore

  return {
    type: 'sentiment-shift',
    level: improved ? '✨ OPPORTUNITY' : '🟡 WARNING',
    severity: improved ? 2 : 3,
    title: `Market Sentiment: ${previousSentiment} → ${currentSentiment}`,
    description: `Investor sentiment has ${improved ? 'improved' : 'deteriorated'}. Market conditions for IPOs are now ${improved ? 'more' : 'less'} favorable.`,
    recommendation: improved
      ? 'Market is more receptive. Consider accelerating IPO timeline if ready.'
      : 'Market headwinds detected. Strengthen your narrative and unit economics.',
    triggerValue: { currentSentiment, previousSentiment, improved },
  }
}

/**
 * Alert Trigger: Competitor Filed S-1
 *
 * When a competitor in your sector files an S-1,
 * creates competitive urgency.
 */
export async function checkCompetitorFiled(competitorName: string, sector: string): Promise<AlertDefinition | null> {
  return {
    type: 'competitor-filed',
    level: '🟡 WARNING',
    severity: 4,
    title: `Competitor Alert: ${competitorName} Filed S-1`,
    description: `${competitorName} (${sector}) has filed their prospectus. Market timing pressure increasing.`,
    recommendation: 'Review their filing for positioning differences. Consider accelerating your timeline to avoid crowded window.',
    triggerValue: { competitor: competitorName, sector },
  }
}

/**
 * Alert Trigger: Readiness Jump
 *
 * When a company's readiness score increases by 5+ points in one day,
 * they may be ready to accelerate.
 */
export async function checkReadinessJump(
  currentScore: number,
  previousScore: number
): Promise<AlertDefinition | null> {
  const delta = currentScore - previousScore

  if (delta < 5) return null

  return {
    type: 'readiness-jump',
    level: '✨ OPPORTUNITY',
    severity: 2,
    title: `Great Progress: Readiness +${delta} Points`,
    description: `Your IPO readiness jumped from ${previousScore} to ${currentScore}. You're gaining momentum.`,
    recommendation: 'Keep up this pace! You may be ready to accelerate your IPO timeline sooner than expected.',
    triggerValue: { currentScore, previousScore, delta },
  }
}

/**
 * Alert Trigger: Runway Alert
 *
 * When a company's estimated runway drops below 12 months,
 * profitability becomes urgent.
 */
export async function checkRunwayAlert(burnRate: number, estimatedCash: number): Promise<AlertDefinition | null> {
  const monthsRemaining = estimatedCash / burnRate

  if (monthsRemaining > 12) return null

  return {
    type: 'runway-alert',
    level: '🔴 CRITICAL',
    severity: 5,
    title: `Runway Alert: ${Math.round(monthsRemaining)} Months Remaining`,
    description: `Your cash runway is declining. You need to reach profitability or raise capital soon.`,
    recommendation: `Focus on unit economics improvements and cost structure review. Consider filing earlier to access public markets for capital.`,
    triggerValue: { monthsRemaining, burnRate },
  }
}

/**
 * Alert Trigger: IPO Calendar Spike
 *
 * When there are >8 SaaS companies filing S-1s in a single week,
 * market is getting crowded.
 */
export async function checkIPOCalendarSpike(weeklyIPOVolume: number): Promise<AlertDefinition | null> {
  if (weeklyIPOVolume <= 8) return null

  return {
    type: 'ipo-calendar-spike',
    level: '🟡 WARNING',
    severity: 2,
    title: `IPO Calendar Spike: ${weeklyIPOVolume} Filings This Week`,
    description: `Market is crowded with ${weeklyIPOVolume} SaaS companies filing this week. Differentiation becomes critical.`,
    recommendation: 'Emphasize your unique competitive advantages and market position.',
    triggerValue: { weeklyIPOVolume },
  }
}

/**
 * MAIN: Process all alert triggers for a company
 */
export async function processAlertTriggers(
  companyId: string,
  currentSnapshot: any,
  previousSnapshot: any | null
): Promise<AlertDefinition[]> {
  const alerts: AlertDefinition[] = []

  try {
    // 1. Market window closing
    const windowAlert = await checkMarketWindowClosing(
      companyId,
      currentSnapshot.ipoReadinessScore,
      calculateDaysToTarget(currentSnapshot.snapshot_date)
    )
    if (windowAlert) alerts.push(windowAlert)

    // 2. Fed rate change
    if (previousSnapshot) {
      const fedAlert = await checkFedRateChange(
        currentSnapshot.fed_rate,
        previousSnapshot.fed_rate,
        currentSnapshot.expected_valuation_90day * 1000000000
      )
      if (fedAlert) alerts.push(fedAlert)
    }

    // 3. Sentiment shift
    if (previousSnapshot) {
      const sentimentAlert = await checkSentimentShift(
        currentSnapshot.market_sentiment,
        previousSnapshot.market_sentiment
      )
      if (sentimentAlert) alerts.push(sentimentAlert)
    }

    // 4. Readiness jump
    if (previousSnapshot) {
      const readinessAlert = await checkReadinessJump(
        currentSnapshot.ipo_readiness_score,
        previousSnapshot.ipo_readiness_score
      )
      if (readinessAlert) alerts.push(readinessAlert)
    }

    // 5. Runway alert (would need to fetch burn rate from DB)
    // Commented out for now - would integrate with financials table
    // const runwayAlert = await checkRunwayAlert(burnRate, estimatedCash)
    // if (runwayAlert) alerts.push(runwayAlert)

    // 6. IPO calendar spike
    const calendarAlert = await checkIPOCalendarSpike(currentSnapshot.ipo_pipeline_volume)
    if (calendarAlert) alerts.push(calendarAlert)

    // Store all alerts in database
    for (const alert of alerts) {
      await storeAlert(companyId, alert)
    }

    return alerts
  } catch (error) {
    console.error(`Error processing alerts for ${companyId}:`, error)
    return []
  }
}

/**
 * HELPER: Store alert in database
 */
async function storeAlert(companyId: string, alert: AlertDefinition): Promise<void> {
  // Check if similar alert already exists (avoid duplicates)
  const [existing] = await sql`
    SELECT id FROM market_advantage_alerts
    WHERE company_id = ${companyId}
    AND alert_type = ${alert.type}
    AND is_active = true
    AND triggered_at > now() - interval '24 hours'
    LIMIT 1
  `

  if (existing) {
    console.log(`Alert ${alert.type} already exists for company ${companyId}, skipping duplicate`)
    return
  }

  // Store alert
  await sql`
    INSERT INTO market_advantage_alerts (
      company_id,
      alert_type,
      alert_level,
      severity,
      title,
      description,
      recommendation,
      triggered_by,
      trigger_value,
      sticky_until
    ) VALUES (
      ${companyId},
      ${alert.type},
      ${alert.level},
      ${alert.severity},
      ${alert.title},
      ${alert.description},
      ${alert.recommendation},
      'scheduled',
      ${JSON.stringify(alert.triggerValue)},
      now() + interval '7 days'
    )
  `

  console.log(`✅ Alert created: ${alert.type} for ${companyId}`)
}

/**
 * HELPER: Calculate days to target IPO date
 */
function calculateDaysToTarget(snapshotDate: string): number {
  // Simplified - would fetch actual target IPO date from companies table
  // For now, assume 180-day default window
  return 180
}

/**
 * QUERY: Fetch active alerts for a company
 */
export async function getActiveAlerts(companyId: string): Promise<AlertDefinition[]> {
  const alerts = await sql`
    SELECT
      alert_type,
      alert_level,
      severity,
      title,
      description,
      recommendation,
      trigger_value
    FROM market_advantage_alerts
    WHERE company_id = ${companyId}
    AND is_active = true
    AND sticky_until > now()
    ORDER BY severity DESC, triggered_at DESC
  `

  return alerts.map((a: any) => ({
    type: a.alert_type,
    level: a.alert_level,
    severity: a.severity,
    title: a.title,
    description: a.description,
    recommendation: a.recommendation,
    triggerValue: a.trigger_value,
  }))
}

/**
 * ACTION: Acknowledge an alert (hide it)
 */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  await sql`
    UPDATE market_advantage_alerts
    SET user_acknowledged_at = now(),
        is_active = false
    WHERE id = ${alertId}
  `
}
