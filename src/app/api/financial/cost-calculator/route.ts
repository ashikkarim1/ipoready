import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CalculateSchema = z.object({
  companyRevenue: z.number().positive('Revenue must be greater than 0'),
  selectedExchange: z.enum(['NYSE', 'NASDAQ', 'ASX', 'TSX', 'CSE', 'OTHER']),
  complexityLevel: z.enum(['simple', 'medium', 'complex']),
  timelineMonths: z.number().int().min(3).max(12),
})

type CalculateRequest = z.infer<typeof CalculateSchema>

const calculateCosts = (req: CalculateRequest) => {
  const { selectedExchange, complexityLevel, timelineMonths } = req
  const ipoSizeEstimate = 50000000 // Base $50M IPO estimate

  // Complexity multiplier
  const complexityMap = { simple: 0, medium: 1, complex: 2 }
  const complexityLevel_num = complexityMap[complexityLevel]

  // Legal: $150k base (TSX) or $300k (NASDAQ), +$50k per complexity level
  const baseLegal = selectedExchange === 'NASDAQ' ? 300000 : 150000
  const legalCosts = baseLegal + (complexityLevel_num * 50000)

  // Accounting: $80k base, +$30k per complexity
  const accountingCosts = 80000 + (complexityLevel_num * 30000)

  // Underwriting: 1.5% of $50M IPO size
  const underwritingCosts = ipoSizeEstimate * 0.015

  // Printing: $50k base, +$25k per complexity
  const printingCosts = 50000 + (complexityLevel_num * 25000)

  // Filing: $20k (TSX) or $50k (NASDAQ)
  const filingCosts = selectedExchange === 'NASDAQ' ? 50000 : 20000

  // Subtotal
  const subtotal = legalCosts + accountingCosts + underwritingCosts + printingCosts + filingCosts

  // Contingency: 10% of subtotal
  const contingencyCosts = subtotal * 0.1

  const totalCosts = subtotal + contingencyCosts

  return {
    breakdown: {
      legal: Math.round(legalCosts),
      accounting: Math.round(accountingCosts),
      underwriting: Math.round(underwritingCosts),
      printing: Math.round(printingCosts),
      filing: Math.round(filingCosts),
      contingency: Math.round(contingencyCosts),
    },
    subtotal: Math.round(subtotal),
    total: Math.round(totalCosts),
    ipoSizeEstimate: Math.round(ipoSizeEstimate),
    costAsPercentageOfIPO: ((totalCosts / ipoSizeEstimate) * 100).toFixed(2),
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = CalculateSchema.parse(body)
    const costAnalysis = calculateCosts(validatedData)

    // Save to database
    await sql`
      INSERT INTO ipo_costs (
        company_id, exchange, estimated_legal, estimated_accounting,
        estimated_underwriting, estimated_printing, estimated_filing,
        estimated_contingency
      ) VALUES (
        ${user.companyId}, ${validatedData.selectedExchange},
        ${costAnalysis.breakdown.legal}, ${costAnalysis.breakdown.accounting},
        ${costAnalysis.breakdown.underwriting}, ${costAnalysis.breakdown.printing},
        ${costAnalysis.breakdown.filing}, ${costAnalysis.breakdown.contingency}
      )
    `

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis: costAnalysis,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[POST /api/financial/cost-calculator] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const costs = await sql`
      SELECT id, exchange, estimated_legal, estimated_accounting,
             estimated_underwriting, estimated_printing, estimated_filing,
             estimated_contingency, total_estimated, created_at
      FROM ipo_costs
      WHERE company_id = ${user.companyId}
      ORDER BY created_at DESC
      LIMIT 1
    ` as any[]

    if (costs.length === 0) {
      return NextResponse.json({ success: true, cost: null })
    }

    const cost = costs[0]
    return NextResponse.json({
      success: true,
      cost: {
        id: cost.id,
        exchange: cost.exchange,
        breakdown: {
          legal: parseFloat(cost.estimated_legal),
          accounting: parseFloat(cost.estimated_accounting),
          underwriting: parseFloat(cost.estimated_underwriting),
          printing: parseFloat(cost.estimated_printing),
          filing: parseFloat(cost.estimated_filing),
          contingency: parseFloat(cost.estimated_contingency),
        },
        total: parseFloat(cost.total_estimated),
        createdAt: cost.created_at,
      },
    })
  } catch (error) {
    console.error('[GET /api/financial/cost-calculator] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
