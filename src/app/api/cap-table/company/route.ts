import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CapTableCompanyResponse {
  companyId: string
  entries: Array<{
    id: string
    shareholderName: string
    shareClassName: string
    quantity: string
    vestedQuantity: string
    grantDate: string
    vestingStartDate: string | null
    vestingCliffMonths: number | null
    vestingPeriodMonths: number | null
    strikePrice: string | null
    grantType: string
  }>
  shareClasses: Array<{
    id: string
    className: string
    preferenceOrder: number
    liquidationPreferenceAmount: string | null
    conversionRatio: string
    votingRights: string
  }>
  investorRounds: Array<{
    id: string
    roundName: string
    roundType: string
    valuationUsd: string
    amountRaisedUsd: string
    closeDate: string
    investorList: string | null
  }>
  statistics: {
    totalSharesOutstanding: string
    totalShareClasses: number
    totalFundingRaisedUsd: string
    latestRound: string | null
  }
}

/**
 * GET /api/cap-table/company/{id}
 * Returns full cap table + current capitalization
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id?: string }> }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await context.params
  const companyId = params?.id || user.companyId

  // Verify user has access to this company
  if (companyId !== user.companyId) {
    // In a real app, check if user has permission
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Fetch cap table entries
    const entries = (await sql`
      SELECT 
        cte.id,
        cte.shareholder_name,
        cte.quantity,
        cte.vested_quantity,
        cte.grant_date,
        cte.vesting_start_date,
        cte.vesting_cliff_months,
        cte.vesting_period_months,
        cte.strike_price,
        cte.grant_type,
        sc.class_name,
        sc.liquidation_preference_amount,
        sc.conversion_ratio
      FROM cap_table_entries cte
      LEFT JOIN share_classes sc ON cte.share_class_id = sc.id
      WHERE cte.company_id = ${companyId}
      ORDER BY sc.preference_order DESC NULLS LAST, cte.shareholder_name ASC
    `) as Array<{
      id: string
      shareholder_name: string
      quantity: string
      vested_quantity: string
      grant_date: string
      vesting_start_date: string | null
      vesting_cliff_months: number | null
      vesting_period_months: number | null
      strike_price: string | null
      grant_type: string
      class_name: string | null
      liquidation_preference_amount: string | null
      conversion_ratio: string | null
    }>

    // Fetch share classes
    const shareClasses = (await sql`
      SELECT id, class_name, preference_order, liquidation_preference_amount, conversion_ratio, voting_rights
      FROM share_classes
      WHERE company_id = ${companyId}
      ORDER BY preference_order DESC
    `) as Array<{
      id: string
      class_name: string
      preference_order: number
      liquidation_preference_amount: string | null
      conversion_ratio: string
      voting_rights: string
    }>

    // Fetch investor rounds
    const investorRounds = (await sql`
      SELECT id, round_name, round_type, valuation_usd, amount_raised_usd, close_date, investor_list
      FROM investor_rounds
      WHERE company_id = ${companyId}
      ORDER BY close_date DESC
    `) as Array<{
      id: string
      round_name: string
      round_type: string
      valuation_usd: string
      amount_raised_usd: string
      close_date: string
      investor_list: string | null
    }>

    // Calculate statistics
    let totalShares = '0'
    let totalFunding = '0'
    let latestRound = null

    if (entries.length > 0) {
      const sum = entries.reduce((acc, entry) => {
        const qty = parseFloat(entry.quantity || '0')
        return acc + qty
      }, 0)
      totalShares = sum.toString()
    }

    if (investorRounds.length > 0) {
      const sum = investorRounds.reduce((acc, round) => {
        const amount = parseFloat(round.amount_raised_usd || '0')
        return acc + amount
      }, 0)
      totalFunding = sum.toFixed(2)
      latestRound = investorRounds[0].round_name
    }

    const response: CapTableCompanyResponse = {
      companyId,
      entries: entries.map((entry) => ({
        id: entry.id,
        shareholderName: entry.shareholder_name,
        shareClassName: entry.class_name || 'Unknown',
        quantity: entry.quantity,
        vestedQuantity: entry.vested_quantity,
        grantDate: entry.grant_date,
        vestingStartDate: entry.vesting_start_date,
        vestingCliffMonths: entry.vesting_cliff_months,
        vestingPeriodMonths: entry.vesting_period_months,
        strikePrice: entry.strike_price,
        grantType: entry.grant_type,
      })),
      shareClasses: shareClasses.map((sc) => ({
        id: sc.id,
        className: sc.class_name,
        preferenceOrder: sc.preference_order,
        liquidationPreferenceAmount: sc.liquidation_preference_amount,
        conversionRatio: sc.conversion_ratio,
        votingRights: sc.voting_rights,
      })),
      investorRounds: investorRounds.map((round) => ({
        id: round.id,
        roundName: round.round_name,
        roundType: round.round_type,
        valuationUsd: round.valuation_usd,
        amountRaisedUsd: round.amount_raised_usd,
        closeDate: round.close_date,
        investorList: round.investor_list,
      })),
      statistics: {
        totalSharesOutstanding: totalShares,
        totalShareClasses: shareClasses.length,
        totalFundingRaisedUsd: totalFunding,
        latestRound,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Cap table fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cap table' },
      { status: 500 }
    )
  }
}
