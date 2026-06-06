import { NextRequest, NextResponse } from 'next/server'
import { batchIngestCompanies } from '@/lib/sec-parser/ingestion-service'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minute timeout for batch processing

/**
 * POST /api/admin/ingest-sec-filings
 * Trigger SEC filing ingestion for specified companies or all companies
 *
 * Query params:
 * - companyIds: comma-separated company IDs (optional, defaults to all)
 * - limit: max number of companies to ingest (default: 50)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession()
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const companyIds = request.nextUrl.searchParams.get('companyIds')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

    // For parameterized queries with Neon, build template literal
    let result: any[] = []

    if (companyIds) {
      const ids = companyIds.split(',')
      result = await sql`
        SELECT id, cik FROM capital_companies
        WHERE cik IS NOT NULL
        AND id = ANY(${ids})
        LIMIT ${limit}
      `
    } else {
      result = await sql`
        SELECT id, cik FROM capital_companies
        WHERE cik IS NOT NULL
        LIMIT ${limit}
      `
    }

    if (result.length === 0) {
      return NextResponse.json({
        message: 'No companies found to ingest',
        count: 0,
      })
    }

    // Trigger batch ingestion
    console.log(`Starting SEC filing ingestion for ${result.length} companies...`)

    const startTime = Date.now()
    const ingestionResults = await batchIngestCompanies(result)
    const duration = Date.now() - startTime

    return NextResponse.json({
      message: 'SEC filing ingestion completed',
      statistics: {
        total: result.length,
        successful: ingestionResults.success,
        failed: ingestionResults.failed,
        duration_ms: duration,
        avg_per_company_ms: Math.round(duration / result.length),
      },
      errors: ingestionResults.errors.slice(0, 10), // Return first 10 errors
    })
  } catch (error) {
    console.error('SEC filing ingestion error:', error)
    return NextResponse.json({
      error: 'SEC filing ingestion failed',
      details: String(error),
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/ingest-sec-filings/status
 * Check ingestion status and last sync times
 */
export async function GET(request: NextRequest) {
  try {
    const syncLog = await sql`
      SELECT * FROM data_sync_log
      WHERE source = 'SEC_EDGAR'
      ORDER BY created_at DESC
      LIMIT 10
    `

    const companies = await sql`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN last_10k_date IS NOT NULL THEN 1 END) as with_10k,
             COUNT(CASE WHEN last_10q_date IS NOT NULL THEN 1 END) as with_10q
      FROM capital_companies
    `

    return NextResponse.json({
      status: 'ok',
      companies_coverage: companies[0],
      recent_syncs: syncLog,
    })
  } catch (error) {
    console.error('Get SEC status error:', error)
    return NextResponse.json({
      error: 'Failed to fetch SEC ingestion status',
    }, { status: 500 })
  }
}
