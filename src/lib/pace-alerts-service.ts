/**
 * PACE Alerts Service
 * 
 * Manages sequencing alerts and validation for IPO milestone tracking.
 * Persists alerts to pace_sequencing_alerts table for API consumption.
 */

import { sql } from '@/lib/db'
import { validateMilestoneSequence } from '@/lib/ipo-sequencing'

export interface PaceAlert {
  id: string
  companyId: string
  rule: string
  severity: 'error' | 'warning'
  remediation: string
  resolvedAt: string | null
  createdAt: string
}

/**
 * Validate company milestone sequencing and persist alerts to database
 * 
 * @param companyId - Company unique identifier
 * @param exchange - Target exchange (nasdaq, nyse, tsx, etc.)
 * @returns Array of persisted alerts
 */
export async function validateAndPersistSequencingAlerts(
  companyId: string,
  exchange: string
): Promise<PaceAlert[]> {
  // Clear existing unresolved alerts for this company
  await sql`
    DELETE FROM pace_sequencing_alerts
    WHERE company_id = ${companyId}
    AND resolved_at IS NULL
  `

  // Get fresh validation results
  const violations = await validateMilestoneSequence(companyId, exchange)

  // Persist new violations as alerts
  const alerts: PaceAlert[] = []
  
  for (const violation of violations) {
    const result = await sql`
      INSERT INTO pace_sequencing_alerts (company_id, rule, severity, remediation)
      VALUES (${companyId}, ${violation.rule}, ${violation.severity}, ${violation.remediation})
      RETURNING id, company_id, rule, severity, remediation, resolved_at, created_at
    `

    if (result.length > 0) {
      const row = result[0] as any
      alerts.push({
        id: row.id,
        companyId: row.company_id,
        rule: row.rule,
        severity: row.severity,
        remediation: row.remediation,
        resolvedAt: row.resolved_at,
        createdAt: row.created_at,
      })
    }
  }

  return alerts
}

/**
 * Fetch unresolved sequencing alerts for a company
 * 
 * @param companyId - Company unique identifier
 * @returns Array of unresolved alerts
 */
export async function getSequencingAlerts(companyId: string): Promise<PaceAlert[]> {
  const rows = await sql`
    SELECT id, company_id, rule, severity, remediation, resolved_at, created_at
    FROM pace_sequencing_alerts
    WHERE company_id = ${companyId}
    AND resolved_at IS NULL
    ORDER BY 
      CASE severity 
        WHEN 'error' THEN 1 
        WHEN 'warning' THEN 2 
        ELSE 3 
      END,
      created_at DESC
  ` as any[]

  return rows.map(row => ({
    id: row.id,
    companyId: row.company_id,
    rule: row.rule,
    severity: row.severity,
    remediation: row.remediation,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  }))
}

/**
 * Mark an alert as resolved
 * 
 * @param alertId - Alert unique identifier
 * @returns Updated alert
 */
export async function resolveAlert(alertId: string): Promise<PaceAlert | null> {
  const result = await sql`
    UPDATE pace_sequencing_alerts
    SET resolved_at = NOW()
    WHERE id = ${alertId}
    RETURNING id, company_id, rule, severity, remediation, resolved_at, created_at
  `

  if (result.length === 0) return null

  const row = result[0] as any
  return {
    id: row.id,
    companyId: row.company_id,
    rule: row.rule,
    severity: row.severity,
    remediation: row.remediation,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  }
}

/**
 * Record PACE score snapshot for trend history
 * 
 * @param companyId - Company unique identifier
 * @param paceScore - Current PACE score (0-100)
 */
export async function recordPaceScoreSnapshot(companyId: string, paceScore: number): Promise<void> {
  await sql`
    INSERT INTO pace_score_history (company_id, pace_score, recorded_at)
    VALUES (${companyId}, ${Math.round(paceScore)}, NOW())
  `
}

/**
 * Get PACE score history for trend analysis
 * 
 * @param companyId - Company unique identifier
 * @param limit - Number of historical records to fetch (default 8 for 8-week trend)
 * @returns Array of score snapshots with timestamps
 */
export async function getPaceScoreTrend(
  companyId: string,
  limit: number = 8
): Promise<Array<{ score: number; date: string }>> {
  const rows = await sql`
    SELECT pace_score, recorded_at
    FROM pace_score_history
    WHERE company_id = ${companyId}
    ORDER BY recorded_at DESC
    LIMIT ${limit}
  ` as any[]

  return rows
    .reverse()
    .map(row => ({
      score: Math.round(row.pace_score),
      date: new Date(row.recorded_at).toISOString().split('T')[0],
    }))
}
