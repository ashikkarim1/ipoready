import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface FinancialData {
  revenueData: Array<{
    period: string
    revenue: number
    previousYearRevenue: number
    growth: number
  }>
  profitabilityData: Array<{
    period: string
    netIncome: number
    profitMargin: number
    grossProfit: number
  }>
  summaryMetrics: {
    totalRevenue: number
    revenueGrowthYoY: number
    netIncome: number
    profitMargin: number
    operatingExpenses: number
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const companyId = (session?.user as any)?.companyId

  if (!session || !companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')

  if (!accountId) {
    return NextResponse.json(
      { error: 'accountId is required' },
      { status: 400 }
    )
  }

  // Mock financial data - in production, this would be fetched from QB/Xero APIs
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const revenueData = months.map((month, index) => {
    const baseRevenue = 500000 + index * 50000
    const previousYearRevenue = 400000 + index * 40000
    return {
      period: month,
      revenue: baseRevenue + Math.random() * 100000,
      previousYearRevenue: previousYearRevenue + Math.random() * 80000,
      growth: ((baseRevenue - previousYearRevenue) / previousYearRevenue) * 100,
    }
  })

  const profitabilityData = months.map((month, index) => {
    const grossProfit = 350000 + index * 35000
    const netIncome = 150000 + index * 15000
    return {
      period: month,
      netIncome: netIncome + Math.random() * 50000,
      profitMargin: (netIncome / (500000 + index * 50000)) * 100,
      grossProfit: grossProfit + Math.random() * 70000,
    }
  })

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalPrevYearRevenue = revenueData.reduce((sum, item) => sum + item.previousYearRevenue, 0)
  const totalNetIncome = profitabilityData.reduce((sum, item) => sum + item.netIncome, 0)
  const avgProfitMargin = profitabilityData.reduce((sum, item) => sum + item.profitMargin, 0) / profitabilityData.length

  const data: FinancialData = {
    revenueData,
    profitabilityData,
    summaryMetrics: {
      totalRevenue,
      revenueGrowthYoY: ((totalRevenue - totalPrevYearRevenue) / totalPrevYearRevenue) * 100,
      netIncome: totalNetIncome,
      profitMargin: avgProfitMargin,
      operatingExpenses: totalRevenue - totalNetIncome - (totalRevenue * 0.25),
    },
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
