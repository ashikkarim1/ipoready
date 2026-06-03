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

  const companyId = user.companyId

  try {
    // 1. Get IPO cost record for the company
    const ipoCostData = await sql`
      SELECT id, total_estimated, currency
      FROM ipo_costs
      WHERE company_id = ${companyId}
      LIMIT 1
    ` as any[]

    if (!ipoCostData || ipoCostData.length === 0) {
      return NextResponse.json({
        summary: {
          estimated_cost: 0,
          actual_spent: 0,
          monthly_burn_rate: 0,
          runway_months: 0,
          variance_pct: 0,
        },
        kpis: {
          total_incurred_items: 0,
          pending_milestones: 0,
          pending_amount_usd: 0,
          next_milestone_date: null,
        },
        risks: {
          delay_cost_per_day_usd: 25000,
          estimated_days_delay: 0,
          total_risk_exposure_usd: 0,
        },
        monthly_tracking: [],
        by_category: [],
      })
    }

    const ipoCost = ipoCostData[0]

    // 2. Fetch financial tracking data (monthly budget vs actual)
    const financialData = await sql`
      SELECT
        id,
        month,
        budgeted_amount,
        actual_spent,
        status,
        notes
      FROM financial_tracking
      WHERE ipo_cost_id = ${ipoCost.id}
      ORDER BY month DESC
      LIMIT 24
    ` as any[]

    // 3. Calculate aggregate metrics from financial tracking
    const totalSpent = financialData.reduce(
      (sum, item) => sum + (parseFloat(item.actual_spent?.toString() || '0')),
      0
    )

    const totalBudgeted = financialData.reduce(
      (sum, item) => sum + (parseFloat(item.budgeted_amount?.toString() || '0')),
      0
    )

    const estimatedTotal = parseFloat(ipoCost.total_estimated?.toString() || '0')

    // 4. Calculate runway metrics based on monthly burn rate
    const monthlyBurnRate = financialData.length > 0
      ? totalSpent / financialData.length
      : estimatedTotal / 12

    // Use estimated total or actual budgeted amount
    const budgetRemaining = Math.max(0, (totalBudgeted > 0 ? totalBudgeted : estimatedTotal) - totalSpent)
    const estimatedTotalIPOBudget = totalBudgeted > 0 ? totalBudgeted : estimatedTotal

    const runwayMonths = monthlyBurnRate > 0 
      ? Math.floor(budgetRemaining / monthlyBurnRate)
      : 12

    // 5. Calculate risk factors (delay costs)
    const delayRiskFactor = 25000 // $25k per day of delay
    const estimatedDaysDelay = 0 // Would come from pace_sequencing_alerts
    
    // Calculate variance
    const costVariancePercent = estimatedTotal > 0 ? ((totalSpent - estimatedTotal) / estimatedTotal) * 100 : 0

    // Format monthly data for response
    const monthlyTracking = financialData.reverse().map(item => {
      const budget = parseFloat(item.budgeted_amount?.toString() || '0')
      const actual = parseFloat(item.actual_spent?.toString() || '0')
      const monthStr = typeof item.month === 'string'
        ? item.month.split('T')[0]
        : new Date(item.month).toISOString().split('T')[0]

      return {
        month: monthStr,
        budget,
        actual,
        variance_pct: budget > 0 ? ((actual - budget) / budget) * 100 : 0,
        status: item.status || 'pending',
      }
    })

    return NextResponse.json({
      summary: {
        estimated_cost: estimatedTotal,
        actual_spent: totalSpent,
        monthly_burn_rate: monthlyBurnRate,
        runway_months: Math.max(0, runwayMonths),
        variance_pct: costVariancePercent,
      },
      kpis: {
        total_incurred_items: financialData.length,
        pending_milestones: 0,
        pending_amount_usd: 0,
        next_milestone_date: null,
      },
      risks: {
        delay_cost_per_day_usd: delayRiskFactor,
        estimated_days_delay: estimatedDaysDelay,
        total_risk_exposure_usd: delayRiskFactor * estimatedDaysDelay,
      },
      monthly_tracking: monthlyTracking,
      by_category: [],
    })
  } catch (error) {
    console.error('Financial tracking API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial tracking data' },
      { status: 500 }
    )
  }
}
