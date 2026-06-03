import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FinancialKPIDashboard } from '@/components/FinancialKPIDashboard'
import { sql } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Financial KPI Tracking',
  description: 'Real-time IPO financial KPI tracking with budget monitoring, runway analysis, and risk assessment',
}

async function getFinancialData(companyId: string) {
  try {
    // Get company details
    const companyResult = await sql`
      SELECT id, name, ipo_timeline_date FROM companies WHERE id = ${companyId}
    ` as any[]

    if (!companyResult || companyResult.length === 0) {
      throw new Error('Company not found')
    }
    
    const company = companyResult[0]

    // Get IPO costs summary
    const ipoCostResult = await sql`
      SELECT 
        id, 
        total_estimated,
        currency
      FROM ipo_costs 
      WHERE company_id = ${companyId}
      LIMIT 1
    ` as any[]

    if (!ipoCostResult || ipoCostResult.length === 0) {
      throw new Error('IPO costs not found')
    }

    const ipoCost = ipoCostResult[0]

    // Get financial tracking data (last 12 months)
    const trackingData = await sql`
      SELECT 
        id,
        month,
        budgeted_amount,
        actual_spent,
        status
      FROM financial_tracking 
      WHERE ipo_cost_id = ${ipoCost.id}
      ORDER BY month DESC
      LIMIT 12
    ` as any[]

    const sortedTracking = trackingData.reverse()

    // Calculate metrics
    const totalActualSpent = trackingData.reduce((sum, t) => sum + (parseFloat(t.actual_spent?.toString()) || 0), 0)
    const totalBudget = trackingData.reduce((sum, t) => sum + (parseFloat(t.budgeted_amount?.toString()) || 0), 0)
    
    // Get estimated cost total
    const estimatedTotal = parseFloat(ipoCost.total_estimated?.toString() || '0')
    
    // Calculate monthly data with variance
    const monthlyData = sortedTracking.map((t) => {
      const budget = parseFloat(t.budgeted_amount?.toString() || '0')
      const actual = parseFloat(t.actual_spent?.toString() || '0')
      const variance = budget > 0 ? ((actual - budget) / budget) * 100 : 0
      
      // Handle both Date objects and ISO strings
      const monthDate = typeof t.month === 'string' ? t.month : new Date(t.month).toISOString().split('T')[0]
      
      return {
        month: monthDate,
        budget,
        actual,
        variance_pct: variance,
      }
    })

    // Get IPO date from company
    const ipoDate = company.ipo_timeline_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    // Calculate metrics
    const daysToIPO = Math.max(0, Math.ceil((new Date(ipoDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    
    // Monthly cost average (for daily rate)
    const avgMonthlySpend = totalActualSpent > 0 && sortedTracking.length > 0 
      ? totalActualSpend / sortedTracking.length
      : estimatedTotal / 12

    const costPerDay = avgMonthlySpend / 30

    // Runway calculation
    const budgetRemaining = Math.max(0, totalBudget - totalActualSpent)
    const runwayDays = costPerDay > 0 ? budgetRemaining / costPerDay : daysToIPO

    // Risk factors (based on actual performance)
    const costVariancePercent = estimatedTotal > 0 ? ((totalActualSpent - estimatedTotal) / estimatedTotal) * 100 : 0
    
    const riskFactors = []
    
    if (costVariancePercent > 20) {
      riskFactors.push({
        label: 'Significant Cost Overrun',
        value: totalActualSpent - estimatedTotal,
        impact: 'critical' as const,
        description: 'Spending has exceeded estimates by more than 20%. Requires immediate corrective action.',
        icon: 'alert' as const,
      })
    }

    if (runwayDays < daysToIPO + 30) {
      riskFactors.push({
        label: 'Runway Squeeze',
        value: Math.max(0, (estimatedTotal * 0.15) - budgetRemaining),
        impact: 'warning' as const,
        description: 'Current runway may not be sufficient to reach IPO date at current burn rate.',
        icon: 'clock' as const,
      })
    }

    if (costPerDay > estimatedTotal / 180) {
      riskFactors.push({
        label: 'Elevated Burn Rate',
        value: (costPerDay * daysToIPO) - estimatedTotal,
        impact: 'warning' as const,
        description: 'Daily spending rate is higher than historical average. Monitor closely.',
        icon: 'trending' as const,
      })
    }

    if (trackingData.length > 0) {
      const recentMonths = trackingData.slice(0, 3)
      const recentAvgVariance = recentMonths.reduce((sum, t) => {
        const budget = parseFloat(t.budgeted_amount.toString())
        const actual = parseFloat(t.actual_spent.toString())
        return sum + (budget > 0 ? ((actual - budget) / budget) * 100 : 0)
      }, 0) / Math.min(3, recentMonths.length)

      if (recentAvgVariance > 10) {
        riskFactors.push({
          label: 'Trend of Overspending',
          value: totalActualSpent * 0.1,
          impact: 'warning' as const,
          description: 'Recent months show consistent overspending trend. Accelerate cost controls.',
          icon: 'trending' as const,
        })
      }
    }

    // Delay risk calculation
    const delayRiskPerDay = estimatedTotal / 180 * 1.5 // 1.5x daily cost
    const estimatedDaysDelay = costVariancePercent > 0 ? Math.min(30, Math.ceil(costVariancePercent / 2)) : 0

    return {
      company: company.name || 'Company',
      estimatedCost: estimatedTotal,
      actualSpent: totalActualSpent,
      budget: totalBudget,
      currencyCode: (ipoCost.currency as string) || 'USD',
      ipoDate,
      monthlyData,
      costPerDay,
      runwayDays: Math.max(0, runwayDays),
      riskFactors,
      delayRiskPerDay,
      estimatedDaysDelay,
    }
  } catch (error) {
    console.error('Error fetching financial data:', error)
    throw error
  }
}

export default async function FinancialTrackingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.companyId) {
    redirect('/login')
  }

  try {
    const data = await getFinancialData(session.user.companyId)

    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto" suppressHydrationWarning>
          <FinancialKPIDashboard
            data={{
              estimatedCost: data.estimatedCost,
              actualSpent: data.actualSpent,
              budget: data.budget,
              currencyCode: data.currencyCode,
              ipoDate: data.ipoDate,
              monthlyData: data.monthlyData,
              costPerDay: data.costPerDay,
              runwayDays: data.runwayDays,
              riskFactors: data.riskFactors,
              delayRiskPerDay: data.delayRiskPerDay,
              estimatedDaysDelay: data.estimatedDaysDelay,
            }}
            companyName={data.company}
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Failed to load financial tracking:', error)
    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#F7F6F4' }}>
        <div className="max-w-7xl mx-auto" suppressHydrationWarning>
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8">
            <h1 className="text-2xl font-bold text-red-900 mb-4">Unable to Load Financial Data</h1>
            <p className="text-red-700 mb-4">
              We encountered an error loading your financial tracking dashboard. Please ensure you have set up IPO costs and financial tracking data.
            </p>
            <p className="text-sm text-red-600">
              Error details have been logged. Contact support if this issue persists.
            </p>
          </div>
        </div>
      </main>
    )
  }
}
