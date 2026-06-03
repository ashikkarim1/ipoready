import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get latest IPO cost
    const costs = await sql`
      SELECT id, total_estimated FROM ipo_costs
      WHERE company_id = ${user.companyId}
      ORDER BY created_at DESC LIMIT 1
    ` as any[]

    if (costs.length === 0) {
      return NextResponse.json({ success: true, tracking: null })
    }

    const costId = costs[0].id
    const totalEstimated = parseFloat(costs[0].total_estimated)

    // Get financial tracking data (6 months)
    const tracking = await sql`
      SELECT month, budgeted_amount, actual_spent, status
      FROM financial_tracking
      WHERE ipo_cost_id = ${costId}
      ORDER BY month ASC
    ` as any[]

    // Calculate KPIs
    const totalActualSpent = tracking.reduce((sum, m) => sum + parseFloat(m.actual_spent), 0)
    const monthlyBurnRate = tracking.length > 0 
      ? Math.round(totalActualSpent / tracking.length)
      : 0
    const remainingBudget = totalEstimated - totalActualSpent
    const runwayMonths = monthlyBurnRate > 0 
      ? Math.round(remainingBudget / monthlyBurnRate)
      : 0

    const chartData = tracking.map(m => ({
      month: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }),
      budgeted: parseFloat(m.budgeted_amount),
      actual: parseFloat(m.actual_spent),
      status: m.status,
    }))

    return NextResponse.json({
      success: true,
      kpis: {
        estimatedTotalCost: Math.round(totalEstimated),
        actualSpentYTD: Math.round(totalActualSpent),
        monthlyBurnRate,
        runwayMonths: Math.max(0, runwayMonths),
      },
      tracking: chartData,
      riskFactors: [
        'Delays increase costs by $50k/week',
        'Legal complexity may add 20-30% to estimates',
        'Underwriting fees locked after pricing agreement',
      ],
    })
  } catch (error) {
    console.error('[GET /api/financial-tracking] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
