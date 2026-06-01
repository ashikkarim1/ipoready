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
    // Get documents in last 24 hours
    const documents24h = await sql`
      SELECT COUNT(*) as count FROM cap_table_documents
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    // Get validation success rate (last 24h)
    const validationStats = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN validation_status = 'valid' THEN 1 ELSE 0 END) as succeeded
      FROM cap_table_documents
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `

    const totalDocuments = (validationStats[0] as any)?.total || 0
    const successDocuments = (validationStats[0] as any)?.succeeded || 0
    const validationSuccessRate = totalDocuments > 0 ? (successDocuments / totalDocuments * 100) : 100

    // Get holdings count (real-time indicator of system usage)
    const holdingsCount = await sql`
      SELECT COUNT(*) as count FROM holdings
    `

    // Determine health status
    let status = 'healthy'
    const issues: string[] = []

    if (totalDocuments === 0) {
      // No documents is normal (info level)
      status = 'healthy'
    } else if (validationSuccessRate < 95) {
      status = 'warning'
      issues.push(`Validation success rate ${validationSuccessRate.toFixed(2)}% below 95% threshold`)
    }

    return NextResponse.json({
      status,
      documentsLast24h: (documents24h[0] as any)?.count || 0,
      validationSuccessRate: validationSuccessRate.toFixed(2),
      statistics: {
        totalDocuments24h: totalDocuments,
        validatedDocuments24h: successDocuments,
        totalHoldings: (holdingsCount[0] as any)?.count || 0,
      },
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
