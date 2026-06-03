/**
 * Dilution Scenario Engine
 * Calculates shareholder dilution across warrant exercises, option vesting,
 * new financing, and employee option grants
 */

import { Decimal } from 'decimal.js'

Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP })

export interface ShareholderPosition {
  shareholderId: string
  shareholderName: string
  shareholderType: 'founder' | 'investor' | 'employee' | 'advisor' | 'other'
  shareClass: string
  currentShares: Decimal
  currentOwnership: Decimal
  postDilutionShares: Decimal
  postDilutionOwnership: Decimal
  dilutionPercentage: Decimal
  dollarImpact?: Decimal
}

export interface DilutionScenarioInput {
  scenarioName: string
  scenarioType: 'base' | 'optimistic' | 'conservative' | 'custom'
  warrantsExercisedPercent?: number
  warrantsExercisedShares?: number
  newFinancingAmount?: number
  newFinancingShares?: number
  employeeOptionVestingShares?: number
  projectedValuation?: number
}

export interface DilutionScenarioResult {
  scenarioId: string
  scenarioName: string
  scenarioType: string
  createdAt: Date
  currentSnapshot: {
    totalShares: Decimal
    totalOwnershipPercentage: Decimal
  }
  postDilutionSnapshot: {
    totalShares: Decimal
    totalOwnershipPercentage: Decimal
    newSharesIssued: Decimal
  }
  shareholderImpact: ShareholderPosition[]
  assumptions: {
    warrantsExercisedPercent?: number
    warrantsExercisedShares?: number
    newFinancingAmount?: number
    newFinancingShares?: number
    employeeOptionVestingShares?: number
    projectedValuation?: number
  }
}

export interface CapTableSnapshot {
  shareholders: Array<{
    id: string
    name: string
    type: 'founder' | 'investor' | 'employee' | 'advisor' | 'other'
    shareClass: string
    quantity: number
    warrants?: number
    options?: number
  }>
  postMoneyValuation: number
}

/**
 * Dilution Scenario Engine
 */
export class DilutionScenarioEngine {
  /**
   * Calculate dilution for a given scenario
   */
  static calculateDilutionScenario(
    capTableSnapshot: CapTableSnapshot,
    input: DilutionScenarioInput
  ): DilutionScenarioResult {
    // Calculate current state
    const currentState = this.calculateCurrentState(capTableSnapshot)

    // Calculate new shares from various sources
    const newSharesBreakdown = this.calculateNewShares(
      capTableSnapshot,
      input,
      currentState.totalCommonEquivalent
    )

    const totalNewShares = newSharesBreakdown.warrantsExercised
      .plus(newSharesBreakdown.optionVesting)
      .plus(newSharesBreakdown.newFinancingShares)

    const postDilutionTotalShares = currentState.totalCommonEquivalent.plus(
      totalNewShares
    )

    // Calculate shareholding before and after
    const shareholderImpact = this.calculateShareholderImpact(
      capTableSnapshot,
      currentState,
      postDilutionTotalShares,
      input.projectedValuation
    )

    return {
      scenarioId: `scenario-${Date.now()}`,
      scenarioName: input.scenarioName,
      scenarioType: input.scenarioType,
      createdAt: new Date(),
      currentSnapshot: {
        totalShares: currentState.totalCommonEquivalent,
        totalOwnershipPercentage: new Decimal(100),
      },
      postDilutionSnapshot: {
        totalShares: postDilutionTotalShares,
        totalOwnershipPercentage: new Decimal(100),
        newSharesIssued: totalNewShares,
      },
      shareholderImpact,
      assumptions: input,
    }
  }

  /**
   * Generate preset scenarios
   */
  static generatePresetScenarios(
    capTableSnapshot: CapTableSnapshot
  ): {
    base: DilutionScenarioResult
    optimistic: DilutionScenarioResult
    conservative: DilutionScenarioResult
  } {
    // Base case: typical IPO scenario
    const baseInput: DilutionScenarioInput = {
      scenarioName: 'Base Case',
      scenarioType: 'base',
      warrantsExercisedPercent: 50,
      employeeOptionVestingShares: Math.floor(
        this.calculateCurrentState(capTableSnapshot).totalCommonEquivalent
          .times(0.05)
          .toNumber()
      ),
      newFinancingAmount: 50000000,
      projectedValuation: 500000000,
    }

    // Optimistic: high warrant exercise, less dilution from new round
    const optimisticInput: DilutionScenarioInput = {
      scenarioName: 'Optimistic Case',
      scenarioType: 'optimistic',
      warrantsExercisedPercent: 75,
      employeeOptionVestingShares: Math.floor(
        this.calculateCurrentState(capTableSnapshot).totalCommonEquivalent
          .times(0.03)
          .toNumber()
      ),
      newFinancingAmount: 75000000,
      projectedValuation: 750000000,
    }

    // Conservative: low warrant exercise, higher dilution
    const conservativeInput: DilutionScenarioInput = {
      scenarioName: 'Conservative Case',
      scenarioType: 'conservative',
      warrantsExercisedPercent: 25,
      employeeOptionVestingShares: Math.floor(
        this.calculateCurrentState(capTableSnapshot).totalCommonEquivalent
          .times(0.08)
          .toNumber()
      ),
      newFinancingAmount: 30000000,
      projectedValuation: 300000000,
    }

    return {
      base: this.calculateDilutionScenario(capTableSnapshot, baseInput),
      optimistic: this.calculateDilutionScenario(
        capTableSnapshot,
        optimisticInput
      ),
      conservative: this.calculateDilutionScenario(
        capTableSnapshot,
        conservativeInput
      ),
    }
  }

  /**
   * Calculate current cap table state
   */
  private static calculateCurrentState(capTableSnapshot: CapTableSnapshot) {
    let totalCommonEquivalent = new Decimal(0)

    for (const shareholder of capTableSnapshot.shareholders) {
      const quantity = new Decimal(shareholder.quantity || 0)
      totalCommonEquivalent = totalCommonEquivalent.plus(quantity)
    }

    return {
      totalCommonEquivalent,
      valuation: new Decimal(capTableSnapshot.postMoneyValuation),
    }
  }

  /**
   * Calculate new shares from different sources
   */
  private static calculateNewShares(
    capTableSnapshot: CapTableSnapshot,
    input: DilutionScenarioInput,
    currentTotalShares: Decimal
  ) {
    let warrantsExercised = new Decimal(0)
    let optionVesting = new Decimal(0)
    let newFinancingShares = new Decimal(0)

    // Warrant exercises
    if (input.warrantsExercisedShares) {
      warrantsExercised = new Decimal(input.warrantsExercisedShares)
    } else if (input.warrantsExercisedPercent) {
      const totalWarrants = capTableSnapshot.shareholders.reduce(
        (sum, sh) => sum + (sh.warrants || 0),
        0
      )
      warrantsExercised = new Decimal(totalWarrants).times(
        input.warrantsExercisedPercent / 100
      )
    }

    // Employee option vesting
    if (input.employeeOptionVestingShares) {
      optionVesting = new Decimal(input.employeeOptionVestingShares)
    }

    // New financing shares
    if (input.newFinancingShares) {
      newFinancingShares = new Decimal(input.newFinancingShares)
    } else if (input.newFinancingAmount && input.projectedValuation) {
      // Calculate price per share at new valuation
      const pricePerShare = new Decimal(input.projectedValuation).dividedBy(
        currentTotalShares.plus(warrantsExercised).plus(optionVesting)
      )
      newFinancingShares = new Decimal(input.newFinancingAmount).dividedBy(
        pricePerShare
      )
    }

    return {
      warrantsExercised,
      optionVesting,
      newFinancingShares,
    }
  }

  /**
   * Calculate impact on each shareholder
   */
  private static calculateShareholderImpact(
    capTableSnapshot: CapTableSnapshot,
    currentState: ReturnType<typeof this.calculateCurrentState>,
    postDilutionTotalShares: Decimal,
    projectedValuation?: number
  ): ShareholderPosition[] {
    const positions: ShareholderPosition[] = []

    for (const shareholder of capTableSnapshot.shareholders) {
      const currentShares = new Decimal(shareholder.quantity)
      const currentOwnership = currentShares
        .dividedBy(currentState.totalCommonEquivalent)
        .times(100)
      const postDilutionOwnership = currentShares
        .dividedBy(postDilutionTotalShares)
        .times(100)
      const dilution = currentOwnership.minus(postDilutionOwnership)

      let dollarImpact: Decimal | undefined
      if (projectedValuation) {
        const currentValue = currentShares.times(
          new Decimal(projectedValuation).dividedBy(
            currentState.totalCommonEquivalent
          )
        )
        const postValue = currentShares.times(
          new Decimal(projectedValuation).dividedBy(postDilutionTotalShares)
        )
        dollarImpact = postValue.minus(currentValue)
      }

      positions.push({
        shareholderId: shareholder.id,
        shareholderName: shareholder.name,
        shareholderType: shareholder.type,
        shareClass: shareholder.shareClass,
        currentShares,
        currentOwnership,
        postDilutionShares: currentShares,
        postDilutionOwnership,
        dilutionPercentage: dilution,
        dollarImpact,
      })
    }

    return positions
  }

  /**
   * Compare two scenarios
   */
  static compareScenarios(
    scenario1: DilutionScenarioResult,
    scenario2: DilutionScenarioResult
  ): Record<string, unknown> {
    const comparison: Record<string, unknown> = {
      scenario1Name: scenario1.scenarioName,
      scenario2Name: scenario2.scenarioName,
      shareholderComparison: {},
    }

    // Build maps for comparison
    const holders1 = new Map(
      scenario1.shareholderImpact.map((sh) => [sh.shareholderId, sh])
    )
    const holders2 = new Map(
      scenario2.shareholderImpact.map((sh) => [sh.shareholderId, sh])
    )

    // Compare dilution across scenarios
    for (const [shareholderId, position1] of holders1) {
      const position2 = holders2.get(shareholderId)
      ;(comparison.shareholderComparison as Record<string, unknown>)[shareholderId] = {
        shareholderName: position1.shareholderName,
        scenario1Ownership: position1.postDilutionOwnership.toString(),
        scenario2Ownership: position2
          ? position2.postDilutionOwnership.toString()
          : '0',
        ownershipDifference:
          position2
            ? position2.postDilutionOwnership
                .minus(position1.postDilutionOwnership)
                .toString()
            : 'N/A',
      }
    }

    return comparison
  }
}
