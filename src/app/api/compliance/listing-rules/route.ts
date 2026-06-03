import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'
import { getExchangeConfig, ExchangeCode } from '@/lib/exchange-config'

export const dynamic = 'force-dynamic'

const ListingRulesRequestSchema = z.object({
  exchange: z.enum(['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']),
  companyName: z.string().optional(),
  publicSharePercentage: z.coerce.number().min(0).max(100),
  publicShares: z.coerce.number().int().positive(),
  minSharePrice: z.coerce.number().positive().optional(),
  hasAuditCommittee: z.boolean().optional(),
  hasNominationCommittee: z.boolean().optional(),
  hasCompensationCommittee: z.boolean().optional(),
})

type ListingRulesRequest = z.infer<typeof ListingRulesRequestSchema>

interface ValidationResult {
  exchange: ExchangeCode
  complianceScore: number
  status: 'ready' | 'at-risk' | 'not-ready'
  metrics: {
    floatCompliant: boolean
    sharesCompliant: boolean
    committeesCompliant: boolean
  }
  gaps: Array<{
    metric: string
    current: number | boolean
    required: number | boolean
    gap: number
    status: 'met' | 'not-met'
    suggestion: string
  }>
  criticalItems: string[]
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = ListingRulesRequestSchema.parse(body)

    const exchange = validatedData.exchange
    const config = getExchangeConfig(exchange)

    // Calculate compliance metrics
    const floatCompliant = validatedData.publicSharePercentage >= config.minPublicFloat
    const sharesCompliant = validatedData.publicShares >= config.minShares
    const priceCompliant = !validatedData.minSharePrice || validatedData.minSharePrice >= (config.minSharePrice || 0)
    const auditCompliant = !config.requiresAuditCommittee || validatedData.hasAuditCommittee === true
    const nominationCompliant = !config.requiresNominationCommittee || validatedData.hasNominationCommittee === true
    const compensationCompliant = !config.requiresCompensationCommittee || validatedData.hasCompensationCommittee === true

    const committeesCompliant = auditCompliant && nominationCompliant && compensationCompliant

    // Calculate gaps
    const gaps = [
      {
        metric: 'Minimum Public Float',
        current: validatedData.publicSharePercentage,
        required: config.minPublicFloat,
        gap: validatedData.publicSharePercentage - config.minPublicFloat,
        status: floatCompliant ? 'met' : 'not-met' as const,
        suggestion: floatCompliant 
          ? 'Public float requirement met' 
          : `Need to increase public float by ${Math.abs(validatedData.publicSharePercentage - config.minPublicFloat).toFixed(1)}%`,
      },
      {
        metric: 'Minimum Public Shares',
        current: validatedData.publicShares,
        required: config.minShares,
        gap: validatedData.publicShares - config.minShares,
        status: sharesCompliant ? 'met' : 'not-met' as const,
        suggestion: sharesCompliant 
          ? 'Share count requirement met'
          : `Need ${(config.minShares - validatedData.publicShares).toLocaleString()} additional shares`,
      },
      {
        metric: 'Minimum Share Price',
        current: validatedData.minSharePrice || 0,
        required: config.minSharePrice || 0,
        gap: (validatedData.minSharePrice || 0) - (config.minSharePrice || 0),
        status: priceCompliant ? 'met' : 'not-met' as const,
        suggestion: priceCompliant 
          ? 'Share price requirement met'
          : `Minimum share price must be at least $${config.minSharePrice?.toFixed(2)}`,
      },
      {
        metric: 'Board Committees',
        current: committeesCompliant,
        required: true,
        gap: committeesCompliant ? 0 : 1,
        status: committeesCompliant ? 'met' : 'not-met' as const,
        suggestion: committeesCompliant
          ? 'All required committees established'
          : `${!auditCompliant ? 'Audit Committee, ' : ''}${!nominationCompliant ? 'Nomination Committee, ' : ''}${!compensationCompliant ? 'Compensation Committee' : ''}`.replace(/, $/, ''),
      },
    ]

    // Determine overall status
    const allMet = gaps.every(g => g.status === 'met')
    const criticalIssues = gaps.filter(g => g.status === 'not-met')
    const complianceScore = Math.round((gaps.filter(g => g.status === 'met').length / gaps.length) * 100)

    const overallStatus: 'ready' | 'at-risk' | 'not-ready' = allMet ? 'ready' : criticalIssues.length > 2 ? 'not-ready' : 'at-risk'

    const result: ValidationResult = {
      exchange,
      complianceScore,
      status: overallStatus,
      metrics: {
        floatCompliant,
        sharesCompliant,
        committeesCompliant,
      },
      gaps: gaps as any,
      criticalItems: criticalIssues.map(g => g.metric),
    }

    // Save to database (non-blocking)
    try {
      await sql`
        INSERT INTO listing_requirements (
          company_id, exchange, min_float_current_pct,
          min_float_required_pct, min_shares_current,
          min_shares_required, board_lot_compliance,
          gap_analysis_json, validated_at
        ) VALUES (
          ${user.companyId}, ${exchange},
          ${validatedData.publicSharePercentage},
          ${config.minPublicFloat},
          ${validatedData.publicShares},
          ${config.minShares},
          ${committeesCompliant},
          ${JSON.stringify(result)}::jsonb,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (company_id, exchange) DO UPDATE SET
          min_float_current_pct = ${validatedData.publicSharePercentage},
          min_shares_current = ${validatedData.publicShares},
          board_lot_compliance = ${committeesCompliant},
          gap_analysis_json = ${JSON.stringify(result)}::jsonb,
          validated_at = CURRENT_TIMESTAMP
      `
    } catch (dbError) {
      console.warn('Database save failed (non-critical):', dbError)
    }

    return NextResponse.json({
      success: true,
      data: result,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[POST /api/compliance/listing-rules] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to retrieve validation history
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const exchange = req.nextUrl.searchParams.get('exchange')

    let query = sql`SELECT * FROM listing_requirements WHERE company_id = ${user.companyId}`
    
    if (exchange) {
      query = sql`SELECT * FROM listing_requirements WHERE company_id = ${user.companyId} AND exchange = ${exchange}`
    }

    const results = await query

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    })

  } catch (error) {
    console.error('[GET /api/compliance/listing-rules] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
