/**
 * Health Check Endpoint: Cap Table System
 * Endpoint: GET /api/health/cap-table
 * 
 * Returns health status of cap table operations
 * Monitoring systems should check this every 60 seconds
 */

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get uploads in last 24 hours
    const uploads24h = await sql`
      SELECT COUNT(*) as count FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    // Get parse success rate (last 24h)
    const parseStats = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN parse_status = 'success' THEN 1 ELSE 0 END) as succeeded
      FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    const totalUploads = (parseStats[0] as any)?.total || 0
    const successUploads = (parseStats[0] as any)?.succeeded || 0
    const parseSuccessRate = totalUploads > 0 ? (successUploads / totalUploads * 100) : 100

    // Get validation errors in last hour
    const validationErrors = await sql`
      SELECT COUNT(*) as count FROM cap_table_validation_errors
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `

    // Calculate average and p95 parse latency
    const parseLatency = await sql`
      SELECT
        AVG(parse_duration_ms::numeric) as avg,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY parse_duration_ms::numeric) as p95,
        MAX(parse_duration_ms::numeric) as max
      FROM cap_table_uploads
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND parse_duration_ms IS NOT NULL
    `

    // Check database query latency for cap_table operations
    const dbLatency = await sql`
      SELECT
        AVG(query_duration_ms::numeric) as avg
      FROM query_performance_log
      WHERE timestamp > NOW() - INTERVAL '1 hour'
        AND (query LIKE '%cap_table%' OR query LIKE '%share_classes%')
    `

    // Determine health status
    let status = 'healthy'
    const issues: string[] = []

    if (totalUploads === 0) {
      // No uploads is normal (info level)
      status = 'healthy'
    } else if (parseSuccessRate < 98) {
      status = 'warning'
      issues.push(`Parse success rate ${parseSuccessRate.toFixed(2)}% below 98% threshold`)
    }

    if ((validationErrors[0] as any)?.count > 5) {
      status = 'warning'
      issues.push(`${(validationErrors[0] as any).count} validation errors in last hour`)
    }

    if ((parseLatency[0] as any)?.p95 > 5000) {
      status = 'warning'
      issues.push(`Parse latency p95 ${(parseLatency[0] as any).p95.toFixed(0)}ms exceeds 5s threshold`)
    }

    if ((dbLatency[0] as any)?.avg > 1000) {
      status = 'warning'
      issues.push(`Database queries averaging ${(dbLatency[0] as any).avg.toFixed(0)}ms`)
    }

    return NextResponse.json({
      status,
      uploadsLast24h: (uploads24h[0] as any)?.count || 0,
      parseSuccessRate: parseSuccessRate.toFixed(2),
      statistics: {
        totalUploads24h: totalUploads,
        successfulUploads24h: successUploads,
      },
      latency: {
        parseAvgMs: (parseLatency[0] as any)?.avg || 0,
        parseP95Ms: (parseLatency[0] as any)?.p95 || 0,
        parseMaxMs: (parseLatency[0] as any)?.max || 0,
        databaseAvgMs: (dbLatency[0] as any)?.avg || 0,
      },
      validationErrors1h: (validationErrors[0] as any)?.count || 0,
      issues,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Health-Check] Cap table health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
