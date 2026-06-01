/**
 * Cap Table Metrics
 * Tracks uploads, parsing, validation, scenario generation, and database performance
 */

import { recordHistogram, incrementCounter, recordGauge } from './metrics'
import { sql } from '@/lib/db'

export interface CapTableMetrics {
  action: 'upload' | 'parse' | 'validate' | 'scenario'
  status: 'success' | 'error'
  latencyMs: number
  fileSizeBytes?: number
  validationErrorRuleType?: string
  companyId?: string
}

/**
 * Record cap table metrics
 */
export function recordCapTableMetrics(metrics: CapTableMetrics): void {
  const { action, status, latencyMs, fileSizeBytes, validationErrorRuleType } = metrics

  // Counter: cap_table_uploads
  if (action === 'upload') {
    incrementCounter('cap_table_uploads', 1, {
      status,
    })
  }

  // Counter: cap_table_parse_success / cap_table_parse_error
  if (action === 'parse') {
    if (status === 'success') {
      incrementCounter('cap_table_parse_success', 1)
    } else {
      incrementCounter('cap_table_parse_error', 1)
    }
  }

  // Counter: cap_table_validation_errors (by rule_type)
  if (action === 'validate' && status === 'error' && validationErrorRuleType) {
    incrementCounter('cap_table_validation_errors', 1, {
      rule_type: validationErrorRuleType,
    })
  }

  // Histogram: cap_table_scenario_generation_latency_ms
  if (action === 'scenario') {
    recordHistogram('cap_table_scenario_generation_latency_ms', latencyMs, 'ms', {
      status,
    })
  }

  // Histogram: cap_table_parse_latency_ms
  if (action === 'parse') {
    recordHistogram('cap_table_parse_latency_ms', latencyMs, 'ms', {
      status,
    })
  }

  // Record file size for uploads
  if (action === 'upload' && fileSizeBytes) {
    recordGauge('cap_table_upload_size_bytes', fileSizeBytes, 'bytes')
  }
}

/**
 * Record database query latency
 */
export function recordCapTableDatabaseLatency(latencyMs: number, queryType: string = 'query'): void {
  recordHistogram('cap_table_database_queries_latency_ms', latencyMs, 'ms', {
    query_type: queryType,
  })
}

/**
 * Get cap table metrics for the last 24 hours
 */
export async function getCapTableMetrics24h() {
  try {
    // Uploads in last 24h
    const uploadsCount = await sql`
      SELECT COUNT(*) as count FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    // Parse success rate
    const parseSuccess = await sql`
      SELECT COUNT(*) as count FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND parse_status = 'success'
    `

    const parseTotal = await sql`
      SELECT COUNT(*) as count FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    // Validation errors by rule
    const validationErrors = await sql`
      SELECT 
        validation_rule,
        COUNT(*) as count
      FROM cap_table_validation_errors
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY validation_rule
      ORDER BY count DESC
      LIMIT 10
    `

    // Parse latency stats
    const parseLatency = await sql`
      SELECT
        AVG(parse_duration_ms::numeric) as avg,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY parse_duration_ms::numeric) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY parse_duration_ms::numeric) as p99,
        MAX(parse_duration_ms::numeric) as max
      FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND parse_duration_ms IS NOT NULL
    `

    // Database query latency (measure from recent queries)
    const dbLatency = await sql`
      SELECT
        AVG(query_duration_ms::numeric) as avg,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY query_duration_ms::numeric) as p95,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY query_duration_ms::numeric) as p99
      FROM query_performance_log
      WHERE timestamp > NOW() - INTERVAL '24 hours'
        AND query_type LIKE '%cap_table%'
    `

    const totalUploads = (uploadsCount[0] as any)?.count || 0
    const successUploads = (parseSuccess[0] as any)?.count || 0

    return {
      uploadsLast24h: totalUploads,
      parseSuccessRate: totalUploads > 0 ? (successUploads / totalUploads * 100).toFixed(2) : 0,
      parseLatency: {
        avg: (parseLatency[0] as any)?.avg || 0,
        p95: (parseLatency[0] as any)?.p95 || 0,
        p99: (parseLatency[0] as any)?.p99 || 0,
        max: (parseLatency[0] as any)?.max || 0,
      },
      databaseLatency: {
        avg: (dbLatency[0] as any)?.avg || 0,
        p95: (dbLatency[0] as any)?.p95 || 0,
        p99: (dbLatency[0] as any)?.p99 || 0,
      },
      validationErrors: (validationErrors as any[]) || [],
    }
  } catch (error) {
    console.error('[CapTable-Metrics] Error getting metrics:', error)
    return {
      uploadsLast24h: 0,
      parseSuccessRate: 0,
      parseLatency: { avg: 0, p95: 0, p99: 0, max: 0 },
      databaseLatency: { avg: 0, p95: 0, p99: 0 },
      validationErrors: [],
    }
  }
}

/**
 * Get uploads for last 30 days (for trending)
 */
export async function getUploadsLast30Days() {
  try {
    return await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
  } catch (error) {
    console.error('[CapTable-Metrics] Error getting 30-day uploads:', error)
    return []
  }
}

/**
 * Get recent uploads with status
 */
export async function getRecentUploads(limit: number = 10) {
  try {
    return await sql`
      SELECT
        id,
        company_id,
        created_at,
        file_name,
        parse_status,
        parse_duration_ms,
        validation_error_count
      FROM cap_table_uploads
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  } catch (error) {
    console.error('[CapTable-Metrics] Error getting recent uploads:', error)
    return []
  }
}
