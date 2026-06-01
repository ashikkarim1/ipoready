/**
 * Cap Table Scenario Engine
 * Generates multiple scenarios: current, fully diluted, post-IPO, bridge, and custom
 */

import { Decimal } from 'decimal.js';

export interface ScenarioSnapshot {
  holdings: Array<{
    shareholder: string;
    shareClass: string;
    quantity: Decimal;
    percentage: number;
  }>;
  totals: {
    sharesOutstanding: Decimal;
    sharesFullyDiluted: Decimal;
    postMoneyValuation: Decimal;
    pricePerShare: Decimal;
    impliedSharePrice: Decimal;
  };
}

export interface Scenario {
  type: 'current' | 'fully_diluted' | 'post_ipo' | 'bridge' | 'custom';
  name: string;
  date: Date;
  snapshot: ScenarioSnapshot;
  assumptions?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface HoldingRecord {
  shareholder: string;
  shareClass: string;
  quantity: number;
  vestedQuantity?: number;
  exercisePrice?: number;
  warrantQuantity?: number;
  convertibleQuantity?: number;
}

interface CapTableState {
  holdings: HoldingRecord[];
  postMoneyValuation: number;
  totalAuthorizedShares: number;
  shareClassPreferences: Map<
    string,
    { preferenceOrder: number; conversionRatio: number }
  >;
}

/**
 * Scenario engine for cap table projections
 */
export class CapTableScenarioEngine {
  /**
   * Generate current scenario (as-of snapshot)
   */
  static generateCurrentScenario(state: CapTableState): Scenario {
    const snapshot = this.calculateSnapshot(state, false, false);

    return {
      type: 'current',
      name: 'Current Capitalization',
      date: new Date(),
      snapshot,
      assumptions: {
        valuation: state.postMoneyValuation,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Generate fully diluted scenario
   * Includes all options, warrants, and convertible securities at the money
   */
  static generateFullyDilutedScenario(state: CapTableState): Scenario {
    const snapshot = this.calculateSnapshot(state, true, false);

    return {
      type: 'fully_diluted',
      name: 'Fully Diluted Capitalization',
      date: new Date(),
      snapshot,
      assumptions: {
        valuation: state.postMoneyValuation,
        includesOptions: true,
        includesWarrants: true,
        includesConvertibles: true,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Generate post-IPO scenario
   * Applies typical IPO adjustments: new shares issued, underwriter options
   */
  static generatePostIPOScenario(
    state: CapTableState,
    ipoSharesIssued: number,
    pricePerShare: number,
    underwriterOptionPercent: number = 0.15
  ): Scenario {
    const newState = { ...state };

    // Calculate IPO proceeds
    const ipoProceeds = ipoSharesIssued * pricePerShare;

    // Add underwriter options (typically 15% of primary offering)
    const underwriterOptions = ipoSharesIssued * underwriterOptionPercent;

    // Create synthetic holdings for IPO shares and underwriter options
    const existingShares = newState.holdings.reduce((sum, h) => sum + h.quantity, 0);
    const postIPOShares = existingShares + ipoSharesIssued + underwriterOptions;

    // Add public shareholders
    newState.holdings.push({
      shareholder: 'Public Shareholders',
      shareClass: 'Common',
      quantity: ipoSharesIssued,
      vestedQuantity: ipoSharesIssued,
    });

    newState.holdings.push({
      shareholder: 'Underwriter Options',
      shareClass: 'Options',
      quantity: underwriterOptions,
      exercisePrice: pricePerShare,
    });

    // Recalculate valuation
    newState.postMoneyValuation = pricePerShare * postIPOShares;

    const snapshot = this.calculateSnapshot(newState, true, true);

    return {
      type: 'post_ipo',
      name: 'Post-IPO Capitalization',
      date: new Date(),
      snapshot,
      assumptions: {
        ipoSharesIssued,
        pricePerShare,
        underwriterOptionPercent,
        postIPOValuation: newState.postMoneyValuation,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Generate bridge scenario
   * Models a bridge financing (usually SAFE or convertible notes)
   */
  static generateBridgeScenario(
    state: CapTableState,
    bridgeAmount: number,
    discountRate: number = 0.2,
    capValuation: number | null = null
  ): Scenario {
    const newState = { ...state };

    // Determine conversion price
    const nextRoundValuation = capValuation || state.postMoneyValuation * 1.5;
    const conversionPrice =
      nextRoundValuation * (1 - discountRate) /
      (newState.holdings.reduce((sum, h) => sum + h.quantity, 0) || 1);

    // Bridge converts to shares
    const bridgeShares = Math.floor(bridgeAmount / conversionPrice);

    newState.holdings.push({
      shareholder: 'Bridge Investors (Converted)',
      shareClass: 'Series A Preferred',
      quantity: bridgeShares,
      vestedQuantity: bridgeShares,
      convertibleQuantity: bridgeShares,
    });

    const totalShares =
      newState.holdings.reduce((sum, h) => sum + h.quantity, 0) || 1;
    newState.postMoneyValuation = nextRoundValuation;

    const snapshot = this.calculateSnapshot(newState, true, false);

    return {
      type: 'bridge',
      name: 'Post-Bridge Financing',
      date: new Date(),
      snapshot,
      assumptions: {
        bridgeAmount,
        discountRate,
        capValuation: capValuation || 'uncapped',
        bridgeSharesIssued: bridgeShares,
        postBridgeValuation: newState.postMoneyValuation,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Generate custom scenario with user-defined assumptions
   */
  static generateCustomScenario(
    state: CapTableState,
    name: string,
    assumptions: Record<string, unknown>,
    modifications: Record<string, number>
  ): Scenario {
    const newState = { ...state };

    // Apply modifications
    for (const [shareholderName, quantity] of Object.entries(modifications)) {
      const existing = newState.holdings.find((h) => h.shareholder === shareholderName);
      if (existing) {
        existing.quantity = quantity;
        if (!existing.vestedQuantity) {
          existing.vestedQuantity = quantity;
        }
      } else {
        newState.holdings.push({
          shareholder: shareholderName,
          shareClass: 'Custom',
          quantity,
          vestedQuantity: quantity,
        });
      }
    }

    // Use custom valuation if provided
    if (typeof assumptions.valuation === 'number') {
      newState.postMoneyValuation = assumptions.valuation;
    }

    const snapshot = this.calculateSnapshot(newState, false, false);

    return {
      type: 'custom',
      name,
      date: new Date(),
      snapshot,
      assumptions,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Calculate scenario snapshot
   */
  private static calculateSnapshot(
    state: CapTableState,
    fullyDiluted: boolean,
    postIPO: boolean
  ): ScenarioSnapshot {
    const holdings: Array<{
      shareholder: string;
      shareClass: string;
      quantity: Decimal;
      percentage: number;
    }> = [];

    // Calculate total shares
    let totalShares = new Decimal(0);

    if (fullyDiluted) {
      // Include options, warrants, convertibles
      for (const holding of state.holdings) {
        let quantity = holding.quantity;

        // Add options (assume all in-the-money)
        if (holding.exercisePrice !== undefined) {
          quantity += holding.warrantQuantity || 0;
        }

        // Add warrants
        quantity += holding.warrantQuantity || 0;

        // Add convertibles
        quantity += holding.convertibleQuantity || 0;

        totalShares = totalShares.plus(new Decimal(quantity));
      }
    } else {
      // Current only
      totalShares = new Decimal(
        state.holdings.reduce((sum, h) => sum + h.quantity, 0)
      );
    }

    // Build holdings with percentages
    for (const holding of state.holdings) {
      let quantity = new Decimal(holding.quantity);

      if (fullyDiluted) {
        quantity = quantity
          .plus(holding.warrantQuantity || 0)
          .plus(holding.convertibleQuantity || 0);
      }

      const percentage = totalShares.greaterThan(0)
        ? quantity.dividedBy(totalShares).times(100).toNumber()
        : 0;

      holdings.push({
        shareholder: holding.shareholder,
        shareClass: holding.shareClass,
        quantity,
        percentage,
      });
    }

    // Calculate price per share
    const pricePerShare = totalShares.greaterThan(0)
      ? new Decimal(state.postMoneyValuation).dividedBy(totalShares)
      : new Decimal(0);

    return {
      holdings,
      totals: {
        sharesOutstanding: totalShares,
        sharesFullyDiluted: totalShares,
        postMoneyValuation: new Decimal(state.postMoneyValuation),
        pricePerShare,
        impliedSharePrice: pricePerShare,
      },
    };
  }

  /**
   * Compare two scenarios
   */
  static compareScenarios(
    scenario1: Scenario,
    scenario2: Scenario
  ): Record<string, unknown> {
    const comparison: Record<string, unknown> = {
      scenario1Name: scenario1.name,
      scenario2Name: scenario2.name,
      shareholderDilution: {},
      valuationComparison: {
        scenario1: scenario1.snapshot.totals.postMoneyValuation.toString(),
        scenario2: scenario2.snapshot.totals.postMoneyValuation.toString(),
      },
    };

    // Compare shareholding percentages
    const holders1 = new Map(
      scenario1.snapshot.holdings.map((h) => [h.shareholder, h.percentage])
    );
    const holders2 = new Map(
      scenario2.snapshot.holdings.map((h) => [h.shareholder, h.percentage])
    );

    for (const [shareholder, pct1] of holders1) {
      const pct2 = holders2.get(shareholder) || 0;
      (comparison.shareholderDilution as Record<string, unknown>)[shareholder] = {
        scenario1: pct1.toFixed(2),
        scenario2: pct2.toFixed(2),
        change: (pct2 - pct1).toFixed(2),
      };
    }

    return comparison;
  }
}
