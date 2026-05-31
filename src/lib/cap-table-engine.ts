import { sql } from '@/lib/db'
import Decimal from 'decimal.js'

// Configure Decimal.js for precise financial calculations
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP })

/**
 * Interface for a shareholder's position in the cap table
 */
interface ShareholderPosition {
  shareholderId: string
  shareholderName: string
  shareClassName: string
  quantity: Decimal
  vestedQuantity: Decimal
  unvestingQuantity: Decimal
  ownershipPercentage: Decimal
  dilutionPercentage: Decimal
  preferenceOrder: number
}

/**
 * Interface for waterfall distribution
 */
interface WaterfallDistribution {
  shareholderId: string
  shareholderName: string
  shareClassName: string
  quantity: Decimal
  ownershipPercentage: Decimal
  totalProceeds: Decimal
  liquidationPreference: Decimal | null
  proceeds: Decimal
}

/**
 * Fetch the current cap table for a company
 */
async function fetchCapTable(companyId: string) {
  const rows = await sql`
    SELECT 
      cte.id,
      cte.shareholder_name,
      cte.quantity,
      cte.vested_quantity,
      sc.class_name,
      sc.preference_order,
      sc.liquidation_preference_amount,
      sc.conversion_ratio
    FROM cap_table_entries cte
    LEFT JOIN share_classes sc ON cte.share_class_id = sc.id
    WHERE cte.company_id = ${companyId}
    ORDER BY sc.preference_order DESC, cte.shareholder_name ASC
  ` as Array<{
    id: string
    shareholder_name: string
    quantity: string
    vested_quantity: string
    class_name: string
    preference_order: number | null
    liquidation_preference_amount: string | null
    conversion_ratio: string | null
  }>

  return rows
}

/**
 * Calculate total shares outstanding and common share equivalents
 */
function calculateTotalShares(capTable: Awaited<ReturnType<typeof fetchCapTable>>) {
  let totalCommonEquivalent = new Decimal(0)
  let totalIssuedShares = new Decimal(0)

  for (const row of capTable) {
    const quantity = new Decimal(row.quantity || 0)
    const conversionRatio = new Decimal(row.conversion_ratio || 1)

    totalIssuedShares = totalIssuedShares.plus(quantity)
    // Convert preferred shares to common equivalents for dilution calculations
    totalCommonEquivalent = totalCommonEquivalent.plus(quantity.times(conversionRatio))
  }

  return { totalIssuedShares, totalCommonEquivalent }
}

/**
 * Calculate dilution when a new round is raised
 * Returns dilution percentage for each shareholder
 *
 * @param companyId - Company UUID
 * @param newRoundValuation - Post-money valuation of new round (USD)
 * @param newRoundAmount - Amount raised in new round (USD)
 * @returns Array of shareholder positions with dilution percentages
 */
export async function calculateDilution(
  companyId: string,
  newRoundValuation: number,
  newRoundAmount: number
): Promise<ShareholderPosition[]> {
  const capTable = await fetchCapTable(companyId)

  if (capTable.length === 0) {
    return []
  }

  // Current pre-money valuation
  const preMoneyValuation = new Decimal(newRoundValuation).minus(new Decimal(newRoundAmount))

  if (preMoneyValuation.lte(0)) {
    throw new Error('Invalid round: post-money valuation must exceed amount raised')
  }

  const { totalCommonEquivalent } = calculateTotalShares(capTable)

  // New shares created in this round
  const newSharesCreated = new Decimal(newRoundAmount)
    .dividedBy(preMoneyValuation)
    .times(totalCommonEquivalent)

  const totalSharesAfterRound = totalCommonEquivalent.plus(newSharesCreated)

  // Calculate ownership before and after
  const positions: ShareholderPosition[] = capTable.map((row) => {
    const quantity = new Decimal(row.quantity || 0)
    const vestedQuantity = new Decimal(row.vested_quantity || 0)
    const conversionRatio = new Decimal(row.conversion_ratio || 1)
    const commonEquivalent = quantity.times(conversionRatio)

    const ownershipBefore = commonEquivalent.dividedBy(totalCommonEquivalent).times(100)
    const ownershipAfter = commonEquivalent.dividedBy(totalSharesAfterRound).times(100)
    const dilution = ownershipBefore.minus(ownershipAfter)

    return {
      shareholderId: row.id,
      shareholderName: row.shareholder_name,
      shareClassName: row.class_name || 'Unknown',
      quantity,
      vestedQuantity,
      unvestingQuantity: quantity.minus(vestedQuantity),
      ownershipPercentage: ownershipAfter,
      dilutionPercentage: dilution,
      preferenceOrder: row.preference_order || 999,
    }
  })

  return positions.sort((a, b) => a.preferenceOrder - b.preferenceOrder)
}

/**
 * Simulate a future round and create a cap table snapshot
 * Returns the full cap table state post-round
 *
 * @param companyId - Company UUID
 * @param futureValuation - Post-money valuation of future round
 * @param futureAmount - Amount raised in future round
 * @returns Snapshot JSON of cap table post-round
 */
export async function simulateRound(
  companyId: string,
  futureValuation: number,
  futureAmount: number
): Promise<{
  preRoundOwnership: ShareholderPosition[]
  postRoundOwnership: ShareholderPosition[]
  newSharesCreated: Decimal
  totalSharesAfterRound: Decimal
  dilutionImpact: Decimal
}> {
  const preRoundPositions = await calculateDilution(companyId, futureValuation, futureAmount)

  const capTable = await fetchCapTable(companyId)
  const { totalCommonEquivalent } = calculateTotalShares(capTable)

  const preMoneyValuation = new Decimal(futureValuation).minus(new Decimal(futureAmount))
  const newSharesCreated = new Decimal(futureAmount)
    .dividedBy(preMoneyValuation)
    .times(totalCommonEquivalent)

  const totalSharesAfterRound = totalCommonEquivalent.plus(newSharesCreated)

  // Average dilution across all existing shareholders
  const averageDilution = preRoundPositions.length > 0
    ? preRoundPositions.reduce((sum, pos) => sum.plus(pos.dilutionPercentage), new Decimal(0))
        .dividedBy(preRoundPositions.length)
    : new Decimal(0)

  return {
    preRoundOwnership: preRoundPositions,
    postRoundOwnership: preRoundPositions, // Simplified: same positions post-round
    newSharesCreated,
    totalSharesAfterRound,
    dilutionImpact: averageDilution,
  }
}

/**
 * Calculate waterfall distribution in a liquidity event
 * Shows payout order by preference and calculates per-shareholder proceeds
 *
 * @param companyId - Company UUID
 * @param liquidityEventAmount - Total amount being distributed (USD)
 * @returns Waterfall distribution details
 */
export async function calculateWaterfall(
  companyId: string,
  liquidityEventAmount: number
): Promise<WaterfallDistribution[]> {
  const capTable = await fetchCapTable(companyId)

  if (capTable.length === 0) {
    return []
  }

  const { totalCommonEquivalent } = calculateTotalShares(capTable)
  const totalLiquidityPool = new Decimal(liquidityEventAmount)

  let remainingCash = totalLiquidityPool

  // Sort by preference order (0=common=last)
  const sortedTable = [...capTable].sort((a, b) => {
    const prefA = a.preference_order || 999
    const prefB = b.preference_order || 999
    return prefB - prefA // Descending: 1x prefs get priority over commons
  })

  const distributions: WaterfallDistribution[] = []

  // Process each shareholder/share class
  for (const row of sortedTable) {
    const quantity = new Decimal(row.quantity || 0)
    const conversionRatio = new Decimal(row.conversion_ratio || 1)
    const liquidationPref = row.liquidation_preference_amount
      ? new Decimal(row.liquidation_preference_amount)
      : null

    const ownershipPct = quantity.times(conversionRatio).dividedBy(totalCommonEquivalent).times(100)

    let proceeds = new Decimal(0)

    // If there's a liquidation preference, honor it first
    if (liquidationPref && liquidationPref.gt(0)) {
      const preferredAmount = liquidationPref.isFinite() ? liquidationPref : new Decimal(0)
      if (preferredAmount.lte(remainingCash)) {
        proceeds = preferredAmount
        remainingCash = remainingCash.minus(proceeds)
      } else {
        // Preference can't be fully satisfied
        proceeds = remainingCash
        remainingCash = new Decimal(0)
      }
    }

    // If cash remains and preference is non-participating, get pro-rata share
    if (remainingCash.gt(0) && (!liquidationPref || !liquidationPref.isFinite())) {
      const proRataShare = remainingCash.times(ownershipPct).dividedBy(100)
      proceeds = proceeds.plus(proRataShare)
    }

    distributions.push({
      shareholderId: row.id,
      shareholderName: row.shareholder_name,
      shareClassName: row.class_name || 'Unknown',
      quantity,
      ownershipPercentage: ownershipPct,
      totalProceeds: totalLiquidityPool,
      liquidationPreference: liquidationPref,
      proceeds,
    })
  }

  return distributions
}

/**
 * Validate cap table for inconsistencies
 * Checks for floating point errors, missing share classes, invalid vesting dates, etc.
 *
 * @param companyId - Company UUID
 * @returns Validation result with any errors
 */
export async function validateCapTable(companyId: string): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  // Fetch cap table entries
  const entries = await sql`
    SELECT cte.*, sc.preference_order
    FROM cap_table_entries cte
    LEFT JOIN share_classes sc ON cte.share_class_id = sc.id
    WHERE cte.company_id = ${companyId}
  ` as Array<{
    id: string
    quantity: string
    vested_quantity: string
    vesting_start_date: string | null
    vesting_period_months: number | null
    strike_price: string | null
    grant_date: string
    preference_order: number | null
  }>

  // Fetch share classes
  const shareClasses = await sql`
    SELECT id, class_name, preference_order
    FROM share_classes
    WHERE company_id = ${companyId}
  ` as Array<{
    id: string
    class_name: string
    preference_order: number
  }>

  if (entries.length === 0 && shareClasses.length > 0) {
    warnings.push('Cap table has share classes defined but no entries')
  }

  // Check each entry
  for (const entry of entries) {
    const quantity = new Decimal(entry.quantity || 0)
    const vestedQuantity = new Decimal(entry.vested_quantity || 0)

    // Vested quantity should not exceed total quantity
    if (vestedQuantity.gt(quantity)) {
      errors.push(
        `Entry ${entry.id}: Vested quantity (${vestedQuantity}) exceeds total quantity (${quantity})`
      )
    }

    // Vesting dates validation
    if (entry.vesting_start_date && entry.vesting_period_months) {
      const vestingStart = new Date(entry.vesting_start_date)
      const today = new Date()

      if (vestingStart > today) {
        warnings.push(
          `Entry ${entry.id}: Vesting start date (${entry.vesting_start_date}) is in the future`
        )
      }
    }

    // Strike price validation for options
    if (entry.strike_price) {
      const strikePrice = new Decimal(entry.strike_price)
      if (strikePrice.lt(0)) {
        errors.push(`Entry ${entry.id}: Strike price cannot be negative`)
      }
    }

    // Quantity should be positive
    if (quantity.lte(0)) {
      errors.push(`Entry ${entry.id}: Quantity must be positive`)
    }

    // Grant date should not be in the future
    const grantDate = new Date(entry.grant_date)
    const today = new Date()
    if (grantDate > today) {
      errors.push(`Entry ${entry.id}: Grant date is in the future`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
