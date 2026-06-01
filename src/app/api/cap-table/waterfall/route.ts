import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import Decimal from 'decimal.js'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  documentId: z.string().uuid(),
  companyId: z.string().uuid(),
  scenarioType: z.enum(['current', 'fully_diluted', 'post_ipo']).optional(),
})

interface WaterfallTranche {
  name: string
  preferences: number
  participationCap: number | null
  participating: boolean
  amount: number
  percentage: number
}

interface WaterfallResult {
  documentId: string
  proceedsAmount: number
  tranches: WaterfallTranche[]
  distributionOrder: Array<{ shareholderName: string; shares: number; amount: number }>
}

/**
 * GET /api/cap-table/waterfall?documentId=X&companyId=Y&scenarioType=post_ipo
 * Calculate liquidation waterfall for cap table document
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const documentId = searchParams.get('documentId')
    const companyId = searchParams.get('companyId')
    const scenarioType = (searchParams.get('scenarioType') || 'post_ipo') as 'current' | 'fully_diluted' | 'post_ipo'

    if (!documentId || !companyId) {
      return NextResponse.json(
        { error: 'Missing documentId or companyId' },
        { status: 400 }
      )
    }

    QuerySchema.parse({ documentId, companyId, scenarioType })

    if (user.companyId && user.companyId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch document and related data
    const docRows = await sql`
      SELECT id FROM cap_table_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
      LIMIT 1
    ` as any[]

    if (docRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Fetch share classes with preferences
    const shareClassRows = await sql`
      SELECT
        id,
        name,
        liquidation_preference,
        participation_cap,
        participating
      FROM share_classes_v2
      WHERE document_id = ${documentId}
      ORDER BY liquidation_preference ASC
    ` as any[]

    // Fetch holdings with current ownership
    const holdingRows = await sql`
      SELECT
        h.id,
        h.shareholder_id,
        h.share_class_id,
        h.quantity,
        s.name as shareholder_name,
        sc.name as share_class_name,
        sc.liquidation_preference
      FROM holdings h
      JOIN shareholders s ON h.shareholder_id = s.id
      JOIN share_classes_v2 sc ON h.share_class_id = sc.id
      WHERE h.document_id = ${documentId}
      ORDER BY sc.liquidation_preference ASC, s.name ASC
    ` as any[]

    // Build waterfall with preferential returns
    const tranches: WaterfallTranche[] = shareClassRows.map(sc => ({
      name: sc.name,
      preferences: new Decimal(sc.liquidation_preference || 1).toNumber(),
      participationCap: sc.participation_cap ? new Decimal(sc.participation_cap).toNumber() : null,
      participating: sc.participating || false,
      amount: 0,
      percentage: 0,
    }))

    // Calculate total shares
    const totalSharesIssued = holdingRows.reduce((sum, h) => {
      return sum.plus(new Decimal(h.quantity || 0))
    }, new Decimal(0))

    // Simulate IPO scenario (default $100M proceeds)
    const proceedsAmount = 100000000 // $100M default
    let remainingProceeds = new Decimal(proceedsAmount)

    // First pass: satisfy preferences
    for (const tranche of tranches) {
      const allocationPercentage = holdingRows
        .filter(h => new Decimal(h.liquidation_preference || 1).toNumber() === tranche.preferences)
        .reduce((sum, h) => sum.plus(new Decimal(h.quantity || 0)), new Decimal(0))
        .dividedBy(totalSharesIssued)

      const trancheAllocation = remainingProceeds.times(allocationPercentage)
      tranche.amount = Math.min(trancheAllocation.toNumber(), remainingProceeds.toNumber())
      tranche.percentage = allocationPercentage.times(100).toNumber()
      remainingProceeds = remainingProceeds.minus(tranche.amount)
    }

    // Build distribution order
    const distributionOrder = holdingRows.map(h => ({
      shareholderName: h.shareholder_name,
      shares: new Decimal(h.quantity || 0).toNumber(),
      amount: remainingProceeds.times(
        new Decimal(h.quantity || 0).dividedBy(totalSharesIssued)
      ).toNumber(),
    }))

    const result: WaterfallResult = {
      documentId,
      proceedsAmount,
      tranches,
      distributionOrder,
    }

    // Log to audit trail
    await sql`
      INSERT INTO cap_table_audit_log
      (document_id, action, change_data, performed_by)
      VALUES (${documentId}, 'waterfall_calculated', ${{ scenarioType, proceedsAmount }}::jsonb, ${user.id})
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/cap-table/waterfall] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
