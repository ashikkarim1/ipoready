import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  exchange: z.string().optional(),
  phaseId: z.string().optional(),
})

/**
 * GET /api/pace/benchmarks
 * Retrieve benchmark data for exchanges and phases
 * Query params: exchange (optional), phaseId (optional)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const exchange = searchParams.get('exchange') || null
  const phaseId = searchParams.get('phaseId') || null

  // Validate query params
  try {
    QuerySchema.parse({ exchange, phaseId })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: (err as any).message },
      { status: 400 }
    )
  }

  try {
    // Build dynamic query based on filters
    // Query all benchmark data
    const benchmarks = await sql`
      SELECT
        target_exchange as exchange,
        current_phase::text as phase,
        COUNT(*) as company_count,
        COALESCE(AVG(pace_score), 0)::int as avg_pace,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pace_score), 0)::int as median_pace,
        COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY pace_score), 0)::int as p90_pace,
        COALESCE(AVG(progress_percentage), 0)::int as avg_completion_pct,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY progress_percentage), 0)::int as median_completion_pct,
        COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY progress_percentage), 0)::int as p90_completion_pct,
        COALESCE(AVG(estimated_days_to_ipo), 0)::int as avg_days_to_ipo,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY estimated_days_to_ipo), 0)::int as median_days_to_ipo
      FROM companies
      GROUP BY target_exchange, current_phase
      ORDER BY target_exchange, current_phase
    ` as any;
    
    // Filter results based on query parameters
    let filteredBenchmarks = (benchmarks.rows || []) as any[];
    if (exchange) {
      filteredBenchmarks = filteredBenchmarks.filter((b: any) => b.exchange === exchange);
    }
    if (phaseId) {
      filteredBenchmarks = filteredBenchmarks.filter((b: any) => b.phase === phaseId.toString());
    }

    const formattedBenchmarks = filteredBenchmarks.map((row: any) => ({
      exchange: row.exchange === 'all' ? null : row.exchange,
      phase: row.phase === 'all' ? null : row.phase,
      companyCount: row.company_count,
      paceBenchmark: {
        avg: row.avg_pace,
        median: row.median_pace,
        p90: row.p90_pace,
      },
      completionBenchmark: {
        avg: row.avg_completion_pct,
        median: row.median_completion_pct,
        p90: row.p90_completion_pct,
      },
      timeToIpoBenchmark: {
        avg: row.avg_days_to_ipo,
        median: row.median_days_to_ipo,
      },
    }))

    return NextResponse.json({
      benchmarks: formattedBenchmarks,
      filters: {
        exchange: exchange || null,
        phaseId: phaseId || null,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/pace/benchmarks] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
