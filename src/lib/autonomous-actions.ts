import { db } from './db'
import { CompletePrediction, PredictionTrigger } from '@/types/predictions'

/**
 * Autonomous Action System
 *
 * Monitors predictions and automatically:
 * - Triggers board meetings for red flags
 * - Notifies investors of changes
 * - Alerts underwriters of timing shifts
 * - Creates internal action items
 * - Escalates critical issues
 *
 * All actions are tracked and logged
 */

/**
 * Process prediction and take autonomous actions
 */
export async function executeAutonomousActions(
  companyId: string,
  newPrediction: CompletePrediction,
  oldPrediction?: CompletePrediction
): Promise<string[]> {
  const actionsExecuted: string[] = []

  try {
    console.log(`[AutoActions] Processing predictions for ${companyId}`)

    // Get current triggers
    const triggers = await db.query(
      `SELECT * FROM prediction_triggers WHERE company_id = $1 AND action_completed = false`,
      [companyId]
    )

    // TRIGGER 1: Red Flag - IPO Success Probability Drops
    if (newPrediction.ipOSuccessProbabilityPercent < 60) {
      const action = await handleLowSuccessProbability(companyId, newPrediction)
      if (action) actionsExecuted.push(action)
    }

    // TRIGGER 2: Red Flag - Customer Concentration Too High
    if (newPrediction.benchmarking.customerConcentrationAnomaly) {
      const action = await handleCustomerConcentration(companyId, newPrediction)
      if (action) actionsExecuted.push(action)
    }

    // TRIGGER 3: Red Flag - Regulatory Blocker Detected
    if (newPrediction.regulatory.blockers.length > 0) {
      const action = await handleRegulatoryBlocker(companyId, newPrediction)
      if (action) actionsExecuted.push(action)
    }

    // TRIGGER 4: Opportunity - Market Window Opens
    if (newPrediction.investor.marketTimingSignal === 'Urgent') {
      const action = await handleMarketOpportunity(companyId, newPrediction)
      if (action) actionsExecuted.push(action)
    }

    // TRIGGER 5: Milestone - PACE Score Reaches Threshold
    if (
      oldPrediction &&
      oldPrediction.pace.currentScore < 75 &&
      newPrediction.pace.currentScore >= 75
    ) {
      const action = await handlePaceThreshold(companyId, newPrediction)
      if (action) actionsExecuted.push(action)
    }

    // TRIGGER 6: Change - IPO Date Shifted Significantly
    if (oldPrediction && hasSignificantDateChange(oldPrediction, newPrediction)) {
      const action = await handleDateChange(companyId, newPrediction, oldPrediction)
      if (action) actionsExecuted.push(action)
    }

    // TRIGGER 7: Warning - Runway Declining
    if (await handleRunwayWarning(companyId, newPrediction)) {
      actionsExecuted.push('Runway warning issued')
    }

    // TRIGGER 8: Urgent - Multiple Red Flags
    if (newPrediction.regulatory.blockers.length > 2) {
      const action = await handleMultipleRedFlags(companyId, newPrediction)
      if (action) actionsExecuted.push(action)
    }

    console.log(`[AutoActions] Executed ${actionsExecuted.length} actions for ${companyId}`)
    return actionsExecuted
  } catch (error) {
    console.error('[AutoActions] Error executing autonomous actions:', error)
    return actionsExecuted
  }
}

/**
 * TRIGGER 1: Low IPO Success Probability
 */
async function handleLowSuccessProbability(
  companyId: string,
  prediction: CompletePrediction
): Promise<string | null> {
  try {
    // Check if we've already triggered this
    const existing = await db.query(
      `SELECT id FROM prediction_triggers
       WHERE company_id = $1 AND trigger_type = 'red_flag_detected' AND metric = 'ipo_success_probability'
       AND action_completed = false`,
      [companyId]
    )

    if (existing.rowCount > 0) {
      return null // Already triggered
    }

    // Create trigger record
    await db.query(
      `INSERT INTO prediction_triggers (
        company_id, trigger_type, metric, current_value, exceeded_threshold,
        recommended_actions, board_meeting_required, investor_communication_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        companyId,
        'red_flag_detected',
        'ipo_success_probability',
        prediction.ipOSuccessProbabilityPercent,
        true,
        JSON.stringify([
          `Address financial readiness (currently ${prediction.financial.readinessScore}/100)`,
          `Resolve regulatory blockers: ${prediction.regulatory.blockers.join(', ')}`,
          `Improve management team readiness (currently ${prediction.management.overallScore}/100)`,
          'Schedule emergency board meeting to discuss remediation',
        ]),
        true, // Board meeting required
        true, // Investor communication required
      ]
    )

    // Create internal alert
    await createInternalAlert(
      companyId,
      'CRITICAL',
      'IPO Success Probability Below 60%',
      `Success probability is ${prediction.ipOSuccessProbabilityPercent}%. Key issues:
      - Financial: ${prediction.financial.readinessScore}/100
      - Regulatory: ${prediction.regulatory.blockers.join(', ') || 'Minor issues'}
      - Management: ${prediction.management.overallScore}/100

      Recommended: Schedule emergency board meeting within 48 hours.`,
      prediction.nextActions
    )

    // Create board agenda item
    await createBoardAgendaItem(
      companyId,
      'URGENT: IPO Success Probability Below Threshold',
      `Review detailed prediction report and approve remediation plan`,
      'Immediately'
    )

    // Notify board members (would send emails)
    console.log(`[AutoActions] Board meeting scheduled for ${companyId}`)

    return 'Low IPO success probability - board meeting scheduled'
  } catch (error) {
    console.error('Error handling low success probability:', error)
    return null
  }
}

/**
 * TRIGGER 2: Customer Concentration Too High
 */
async function handleCustomerConcentration(
  companyId: string,
  prediction: CompletePrediction
): Promise<string | null> {
  try {
    // Create strategic action plan
    const actions = [
      'Identify top 3 accounts - schedule retention calls',
      'Launch customer diversification initiative',
      'Set KPI: Reduce top customer to <15% within 12 months',
      'Create product/sales plan to land 3 new enterprise customers',
    ]

    await createBoardAgendaItem(
      companyId,
      'Customer Concentration Risk Mitigation',
      `Top customer represents significant revenue concentration.
       Valuation impact: -$${Math.abs(Math.round(prediction.investor.valuationMid * (prediction.benchmarking.anomalyValuationImpactPercent / 100)))}M.

       Recommended actions:
       ${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`,
      'This week'
    )

    // Create KPI tracking
    await createKpiObjective(companyId, 'Customer Concentration', 15, 'percent_from_largest_customer')

    return 'Customer concentration risk flagged - strategic plan created'
  } catch (error) {
    console.error('Error handling customer concentration:', error)
    return null
  }
}

/**
 * TRIGGER 3: Regulatory Blocker
 */
async function handleRegulatoryBlocker(
  companyId: string,
  prediction: CompletePrediction
): Promise<string | null> {
  try {
    const blockers = prediction.regulatory.blockers
    const estimatedDelay = prediction.regulatory.predictedSecReviewDays - 30

    await createInternalAlert(
      companyId,
      'HIGH',
      'Regulatory Blockers Identified',
      `${blockers.length} regulatory blockers detected:
      ${blockers.map((b, i) => `${i + 1}. ${b}`).join('\n')}

      Estimated SEC review delay: ${estimatedDelay} days

      Immediate action: Assign General Counsel to create remediation timeline.`,
      prediction.nextActions
    )

    // Create task for General Counsel
    await createTask(
      companyId,
      'General Counsel',
      `Remediate regulatory blockers: ${blockers[0]}`,
      prediction.regulatory.remediationWeeks * 7
    )

    // Notify underwriter
    if (estimatedDelay > 30) {
      console.log(`[AutoActions] Notifying underwriter of ${estimatedDelay} day delay`)
      // In production: Send email to underwriter
    }

    return `Regulatory blockers detected - ${prediction.regulatory.remediationWeeks} weeks to remediate`
  } catch (error) {
    console.error('Error handling regulatory blocker:', error)
    return null
  }
}

/**
 * TRIGGER 4: Market Opportunity
 */
async function handleMarketOpportunity(
  companyId: string,
  prediction: CompletePrediction
): Promise<string | null> {
  try {
    await createInternalAlert(
      companyId,
      'OPPORTUNITY',
      'Optimal IPO Market Window Open',
      `Market conditions are optimal for IPO launch:

      - Investor appetite: ${prediction.investor.demand}
      - Predicted valuation: $${prediction.investor.valuationMid}M - $${prediction.investor.valuationHigh}M
      - Market timing: ${prediction.investor.marketTimingSignal}
      - Window closes: ${prediction.investor.optimalWindowEnd.toLocaleDateString()}

      Recommended: Begin final preparations immediately.
      Timeline: IPO should launch within 60 days to capture window.`,
      [
        {
          action: 'Finalize prospectus and submit for SEC review',
          priority: 'Immediate',
          estimatedHours: 160,
          responsibility: 'General Counsel',
          impactIfNotDone: 'Missed market window',
        },
        {
          action: 'Schedule underwriter meetings',
          priority: 'Immediate',
          estimatedHours: 40,
          responsibility: 'CEO',
          impactIfNotDone: 'Lose negotiating leverage',
        },
      ]
    )

    // Create milestone reminder
    await createMilestoneReminder(
      companyId,
      'IPO Launch Window Close',
      prediction.investor.optimalWindowEnd,
      'Optimal market window closes. If not launched, may lose favorable terms.'
    )

    return 'Market window open - accelerated launch recommended'
  } catch (error) {
    console.error('Error handling market opportunity:', error)
    return null
  }
}

/**
 * TRIGGER 5: PACE Threshold Reached
 */
async function handlePaceThreshold(
  companyId: string,
  prediction: CompletePrediction
): Promise<string | null> {
  try {
    await createInternalAlert(
      companyId,
      'MILESTONE',
      'PACE Score Reached 75 - Investor Ready',
      `Congratulations! PACE readiness score has reached 75.

      Current status:
      - PACE Score: ${prediction.pace.currentScore}/100
      - Investor readiness: Achieved
      - Estimated IPO date: ${prediction.recommendedIpoDate.toLocaleDateString()}
      - Success probability: ${prediction.ipOSuccessProbabilityPercent}%

      Next milestone: Reach PACE 85 (timeline: ${prediction.pace.monthsToTarget} months)

      Recommended: Begin investor outreach and pre-marketing activities.`,
      []
    )

    // Notify CEO
    console.log(`[AutoActions] PACE 75 reached - investor outreach can begin`)

    return 'PACE 75 threshold reached - investor outreach approved'
  } catch (error) {
    console.error('Error handling PACE threshold:', error)
    return null
  }
}

/**
 * TRIGGER 6: IPO Date Changed Significantly
 */
async function handleDateChange(
  companyId: string,
  newPrediction: CompletePrediction,
  oldPrediction: CompletePrediction
): Promise<string | null> {
  try {
    const daysShift = Math.round(
      (newPrediction.recommendedIpoDate.getTime() - oldPrediction.recommendedIpoDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const direction = daysShift > 0 ? 'delayed' : 'accelerated'

    await createInternalAlert(
      companyId,
      daysShift > 30 ? 'HIGH' : 'MEDIUM',
      `IPO Timeline ${direction.toUpperCase()} by ${Math.abs(daysShift)} Days`,
      `Recommended IPO date has changed:

      Previous: ${oldPrediction.recommendedIpoDate.toLocaleDateString()}
      New: ${newPrediction.recommendedIpoDate.toLocaleDateString()}

      Change: ${daysShift > 0 ? '+' : ''}${daysShift} days (${direction})

      Reason: ${getPredictionChangedReason(oldPrediction, newPrediction)}

      Action: Update investor communications and internal timeline.`,
      []
    )

    // If major change, notify underwriter
    if (Math.abs(daysShift) > 60) {
      console.log(`[AutoActions] Notifying underwriter of ${daysShift} day timeline change`)
    }

    return `IPO date ${direction} by ${Math.abs(daysShift)} days`
  } catch (error) {
    console.error('Error handling date change:', error)
    return null
  }
}

/**
 * TRIGGER 7: Cash Runway Warning
 */
async function handleRunwayWarning(companyId: string, prediction: CompletePrediction): Promise<boolean> {
  try {
    if (prediction.financial.cashRunwayStatus === 'Critical') {
      await createInternalAlert(
        companyId,
        'CRITICAL',
        'Cash Runway Critical',
        `Cash runway is critically low. Immediate action required:

        - Current runway: < 6 months
        - IPO timeline: ${Math.round((prediction.recommendedIpoDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days

        Options:
        1. Accelerate IPO (preferred)
        2. Raise bridge round (fallback)
        3. Cut burn rate (risk to growth)

        Recommendation: Begin bridge fundraising immediately while preparing IPO.`,
        []
      )
      return true
    }
    return false
  } catch (error) {
    console.error('Error handling runway warning:', error)
    return false
  }
}

/**
 * TRIGGER 8: Multiple Red Flags
 */
async function handleMultipleRedFlags(
  companyId: string,
  prediction: CompletePrediction
): Promise<string | null> {
  try {
    const issues = [
      ...(prediction.regulatory.blockers.length > 0 ? [`${prediction.regulatory.blockers.length} regulatory blockers`] : []),
      ...(prediction.financial.readinessScore < 70 ? ['Financial readiness below 70'] : []),
      ...(prediction.management.overallScore < 75 ? ['Management team needs development'] : []),
    ]

    await createInternalAlert(
      companyId,
      'CRITICAL',
      'Multiple Red Flags Detected',
      `${issues.length} critical issues identified:

      ${issues.map((i) => `- ${i}`).join('\n')}

      This combination significantly delays IPO readiness.

      Recommendation: Schedule emergency board meeting to prioritize remediation.`,
      prediction.nextActions
    )

    // Schedule emergency board meeting
    await createBoardAgendaItem(
      companyId,
      'EMERGENCY: Multiple Critical Issues',
      'Review all outstanding issues and create consolidated remediation plan',
      'Tomorrow'
    )

    return 'Multiple red flags - emergency board meeting scheduled'
  } catch (error) {
    console.error('Error handling multiple red flags:', error)
    return null
  }
}

/**
 * Helper functions
 */

async function createInternalAlert(
  companyId: string,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPPORTUNITY' | 'MILESTONE',
  title: string,
  message: string,
  nextActions: any[]
): Promise<void> {
  console.log(`[Alert] [${severity}] ${title}: ${message.substring(0, 100)}...`)
  // In production: Store in alerts table, send email/Slack
}

async function createBoardAgendaItem(
  companyId: string,
  topic: string,
  description: string,
  urgency: string
): Promise<void> {
  console.log(`[Board] Add agenda item: ${topic} (${urgency})`)
  // In production: Create in board agenda system
}

async function createTask(
  companyId: string,
  responsibility: string,
  task: string,
  daysToComplete: number
): Promise<void> {
  console.log(`[Task] Assign to ${responsibility}: ${task} (due in ${daysToComplete} days)`)
  // In production: Create task in project management system
}

async function createKpiObjective(
  companyId: string,
  metricName: string,
  target: number,
  unit: string
): Promise<void> {
  console.log(`[KPI] Set objective: ${metricName} → ${target} ${unit}`)
  // In production: Create KPI tracking
}

async function createMilestoneReminder(
  companyId: string,
  milestone: string,
  dueDate: Date,
  description: string
): Promise<void> {
  console.log(`[Milestone] ${milestone} due ${dueDate.toLocaleDateString()}: ${description}`)
  // In production: Create calendar reminder
}

function hasSignificantDateChange(old: CompletePrediction, newPred: CompletePrediction): boolean {
  const daysDiff = Math.abs(
    (newPred.recommendedIpoDate.getTime() - old.recommendedIpoDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysDiff >= 30
}

function getPredictionChangedReason(old: CompletePrediction, newPred: CompletePrediction): string {
  if (newPred.ipOSuccessProbabilityPercent < old.ipOSuccessProbabilityPercent) {
    return 'IPO success probability decreased'
  }
  if (newPred.financial.readinessScore !== old.financial.readinessScore) {
    return `Financial readiness changed (${old.financial.readinessScore} → ${newPred.financial.readinessScore})`
  }
  return 'Market conditions or company metrics changed'
}
