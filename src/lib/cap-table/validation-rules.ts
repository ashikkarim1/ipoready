/**
 * Cap Table Validation Rules
 * Comprehensive validation rules for cap table data integrity
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  isValid: boolean;
  severity: ValidationSeverity;
  rule: string;
  message: string;
  details?: Record<string, unknown>;
  affectedRows?: string[];
  suggestion?: string;
}

// ====================================================================
// CATEGORY 1: Share Conservation Rules
// ====================================================================

export const shareConservationRules = {
  /**
   * Rule 1.1: Authorized vs Issued Shares
   * Total issued shares across all classes must not exceed authorized shares
   */
  authorizedVsIssued(
    totalIssued: number,
    authorizedShares: number
  ): ValidationResult {
    const isValid = totalIssued <= authorizedShares;
    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Share Conservation - Authorized vs Issued',
      message: isValid
        ? `Issued shares (${totalIssued}) are within authorized limit (${authorizedShares})`
        : `Total issued shares (${totalIssued}) exceed authorized shares (${authorizedShares})`,
      details: {
        totalIssued,
        authorizedShares,
        overage: Math.max(0, totalIssued - authorizedShares),
      },
      suggestion: isValid ? undefined : 'Increase authorized share count or verify issued share calculations',
    };
  },

  /**
   * Rule 1.2: Vesting Consistency
   * Vested quantity cannot exceed total issued quantity
   */
  vestingConsistency(
    vestedQuantity: number,
    totalQuantity: number,
    shareholderName: string
  ): ValidationResult {
    const isValid = vestedQuantity <= totalQuantity;
    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Share Conservation - Vesting Consistency',
      message: isValid
        ? `Vested shares (${vestedQuantity}) for ${shareholderName} are valid`
        : `Vested shares (${vestedQuantity}) exceed total shares (${totalQuantity}) for ${shareholderName}`,
      details: {
        shareholder: shareholderName,
        vestedQuantity,
        totalQuantity,
        excess: Math.max(0, vestedQuantity - totalQuantity),
      },
      affectedRows: [shareholderName],
      suggestion: isValid ? undefined : 'Verify vesting calculation or total share quantity',
    };
  },
};

// ====================================================================
// CATEGORY 2: Currency Consistency Rules
// ====================================================================

export const currencyConsistencyRules = {
  /**
   * Rule 2.1: Single Document Currency
   * All transactions in cap table must use same currency
   */
  singleDocumentCurrency(
    currencies: string[],
    documentName: string
  ): ValidationResult {
    const uniqueCurrencies = new Set(currencies);
    const isValid = uniqueCurrencies.size <= 1;

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Currency Consistency - Single Document Currency',
      message: isValid
        ? `All transactions use consistent currency (${[...uniqueCurrencies][0]})`
        : `Document contains multiple currencies: ${[...uniqueCurrencies].join(', ')}`,
      details: {
        document: documentName,
        currencies: [...uniqueCurrencies],
        transactionCount: currencies.length,
      },
      suggestion: isValid ? undefined : 'Ensure all transactions use the same base currency or convert explicitly',
    };
  },
};

// ====================================================================
// CATEGORY 3: Waterfall Calculation Rules
// ====================================================================

export const waterfallRules = {
  /**
   * Rule 3.1: Liquidation Preference Order
   * Preferences must be applied in correct order by preference level
   */
  liquidationPreferenceOrder(
    preferences: Array<{ name: string; preferenceOrder: number }>
  ): ValidationResult {
    const sorted = [...preferences].sort((a, b) => a.preferenceOrder - b.preferenceOrder);
    const isValid = JSON.stringify(preferences) === JSON.stringify(sorted);

    return {
      isValid,
      severity: isValid ? 'info' : 'warning',
      rule: 'Waterfall - Liquidation Preference Order',
      message: isValid
        ? 'Liquidation preferences are in correct order'
        : 'Liquidation preferences are not in correct order',
      details: {
        current: preferences.map((p) => `${p.name} (${p.preferenceOrder})`),
        recommended: sorted.map((p) => `${p.name} (${p.preferenceOrder})`),
      },
      suggestion: isValid ? undefined : 'Reorder preferences according to preference level (lower numbers = higher priority)',
    };
  },

  /**
   * Rule 3.2: Waterfall Calculation Validation
   * Verify cascade of distributions is mathematically correct
   */
  waterfallCalculation(
    liquidity: number,
    waterfall: Array<{ class: string; amount: number; percentage: number }>
  ): ValidationResult {
    const total = waterfall.reduce((sum, item) => sum + item.amount, 0);
    const isValid = Math.abs(total - liquidity) < 0.01; // Allow small rounding differences

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Waterfall - Calculation Validation',
      message: isValid
        ? `Waterfall total ($${total}) equals liquidity event ($${liquidity})`
        : `Waterfall total ($${total}) does not equal liquidity event ($${liquidity})`,
      details: {
        liquidityAmount: liquidity,
        waterfallTotal: total,
        difference: Math.abs(total - liquidity),
        distribution: waterfall,
      },
      suggestion: isValid ? undefined : 'Verify preference multiples and priority order in liquidation calculation',
    };
  },
};

// ====================================================================
// CATEGORY 4: Dilution Tracking Rules
// ====================================================================

export const dilutionRules = {
  /**
   * Rule 4.1: Ownership Percentage Calculation
   * Ownership percentages must sum to 100% on fully diluted basis
   */
  ownershipPercentageSum(
    holdings: Array<{ name: string; fdPercentage: number }>,
    tolerance: number = 0.01
  ): ValidationResult {
    const total = holdings.reduce((sum, h) => sum + h.fdPercentage, 0);
    const isValid = Math.abs(total - 100) <= tolerance;

    return {
      isValid,
      severity: isValid ? 'info' : 'warning',
      rule: 'Dilution - Ownership Percentage Sum',
      message: isValid
        ? `Ownership percentages sum to 100% (actual: ${total.toFixed(2)}%)`
        : `Ownership percentages do not sum to 100% (actual: ${total.toFixed(2)}%)`,
      details: {
        total: total.toFixed(2),
        holdings: holdings.map((h) => ({
          ...h,
          percentage: h.fdPercentage.toFixed(2),
        })),
        variance: (total - 100).toFixed(2),
      },
      suggestion: isValid ? undefined : 'Check if any shares are missing from the cap table or if rounding errors are present',
    };
  },

  /**
   * Rule 4.2: Dilution Tracking
   * Verify FD ownership is lower than current ownership (except new shares)
   */
  dilutionTracking(
    currentOwnership: number,
    fdOwnership: number,
    shareholderName: string
  ): ValidationResult {
    const isValid = fdOwnership <= currentOwnership || currentOwnership < 0.01; // Allow for new shareholders

    return {
      isValid,
      severity: isValid ? 'info' : 'warning',
      rule: 'Dilution - Ownership Dilution Tracking',
      message: isValid
        ? `${shareholderName}: FD ownership (${fdOwnership.toFixed(2)}%) is appropriate`
        : `${shareholderName}: FD ownership (${fdOwnership.toFixed(2)}%) exceeds current (${currentOwnership.toFixed(2)}%)`,
      details: {
        shareholder: shareholderName,
        currentOwnership: currentOwnership.toFixed(2),
        fdOwnership: fdOwnership.toFixed(2),
        dilution: (currentOwnership - fdOwnership).toFixed(2),
      },
      affectedRows: [shareholderName],
      suggestion: isValid ? undefined : 'Verify share calculations and ensure FD scenario includes new shares',
    };
  },
};

// ====================================================================
// CATEGORY 5: Vesting Constraint Rules
// ====================================================================

export const vestingRules = {
  /**
   * Rule 5.1: Valid Date Sequence
   * Vesting start must be before cliff, cliff before end
   */
  validDateSequence(
    vestingStart: Date,
    cliffDate: Date | null,
    vestingEnd: Date,
    shareholderName: string
  ): ValidationResult {
    let isValid = vestingStart < vestingEnd;
    if (cliffDate) {
      isValid = isValid && vestingStart <= cliffDate && cliffDate < vestingEnd;
    }

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Vesting - Valid Date Sequence',
      message: isValid
        ? `${shareholderName}: Vesting dates are in correct sequence`
        : `${shareholderName}: Vesting dates are out of sequence`,
      details: {
        shareholder: shareholderName,
        vestingStart: vestingStart.toISOString().split('T')[0],
        cliffDate: cliffDate ? cliffDate.toISOString().split('T')[0] : 'N/A',
        vestingEnd: vestingEnd.toISOString().split('T')[0],
      },
      affectedRows: [shareholderName],
      suggestion: isValid
        ? undefined
        : 'Ensure vesting start <= cliff date <= vesting end date',
    };
  },

  /**
   * Rule 5.2: Cliff Consistency
   * Cliff percentage must be between 0-100
   */
  cliffPercentage(
    cliffPercent: number,
    shareholderName: string
  ): ValidationResult {
    const isValid = cliffPercent >= 0 && cliffPercent <= 100;

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Vesting - Cliff Percentage',
      message: isValid
        ? `${shareholderName}: Cliff percentage (${cliffPercent}%) is valid`
        : `${shareholderName}: Cliff percentage (${cliffPercent}%) is invalid`,
      details: {
        shareholder: shareholderName,
        cliffPercent,
      },
      affectedRows: [shareholderName],
      suggestion: isValid ? undefined : 'Cliff percentage must be between 0 and 100',
    };
  },
};

// ====================================================================
// CATEGORY 6: Warrant & Performance Share Rules
// ====================================================================

export const warrantRules = {
  /**
   * Rule 6.1: Exercise Price Validation
   * Warrant exercise price must be positive
   */
  exercisePriceValidation(
    exercisePrice: number,
    shareClassName: string,
    shareholderName: string
  ): ValidationResult {
    const isValid = exercisePrice > 0;

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Warrant - Exercise Price Validation',
      message: isValid
        ? `${shareholderName}: Exercise price ($${exercisePrice}) is valid`
        : `${shareholderName}: Exercise price ($${exercisePrice}) must be positive`,
      details: {
        shareholder: shareholderName,
        shareClass: shareClassName,
        exercisePrice,
      },
      affectedRows: [shareholderName],
      suggestion: isValid ? undefined : 'Exercise price must be greater than zero',
    };
  },

  /**
   * Rule 6.2: Warrant Expiration
   * Expiration date must be in the future or null
   */
  warrantExpiration(
    expirationDate: Date | null,
    shareholderName: string
  ): ValidationResult {
    const isValid = !expirationDate || expirationDate > new Date();

    return {
      isValid,
      severity: isValid ? 'info' : 'warning',
      rule: 'Warrant - Expiration Validation',
      message: isValid
        ? `${shareholderName}: Warrant expiration is valid`
        : `${shareholderName}: Warrant has expired`,
      details: {
        shareholder: shareholderName,
        expirationDate: expirationDate ? expirationDate.toISOString().split('T')[0] : 'Perpetual',
      },
      affectedRows: [shareholderName],
      suggestion: isValid ? undefined : 'Check if warrant is still valid or has been exercised',
    };
  },
};

// ====================================================================
// CATEGORY 7: Consolidation Consistency Rules
// ====================================================================

export const consolidationRules = {
  /**
   * Rule 7.1: No Duplicate Holdings
   * No duplicate shareholder/share class combinations
   */
  noDuplicateHoldings(
    holdings: Array<{ shareholder: string; shareClass: string }>
  ): ValidationResult {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const holding of holdings) {
      const key = `${holding.shareholder}|${holding.shareClass}`;
      if (seen.has(key)) {
        duplicates.push(`${holding.shareholder} / ${holding.shareClass}`);
      }
      seen.add(key);
    }

    const isValid = duplicates.length === 0;

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Consolidation - No Duplicate Holdings',
      message: isValid
        ? 'No duplicate holdings found'
        : `Found ${duplicates.length} duplicate holdings`,
      details: {
        duplicates,
        totalHoldings: holdings.length,
      },
      affectedRows: duplicates,
      suggestion: isValid ? undefined : 'Consolidate duplicate holdings or verify shareholder/class assignments',
    };
  },

  /**
   * Rule 7.2: Share Class Consistency
   * All holdings must reference valid share classes
   */
  shareClassConsistency(
    holdings: Array<{ shareholder: string; shareClass: string }>,
    validClasses: string[]
  ): ValidationResult {
    const invalidHoldings = holdings.filter((h) => !validClasses.includes(h.shareClass));
    const isValid = invalidHoldings.length === 0;

    return {
      isValid,
      severity: isValid ? 'info' : 'error',
      rule: 'Consolidation - Share Class Consistency',
      message: isValid
        ? 'All holdings reference valid share classes'
        : `Found ${invalidHoldings.length} holdings with invalid share classes`,
      details: {
        validClasses,
        invalidHoldings: invalidHoldings.map((h) => `${h.shareholder} / ${h.shareClass}`),
      },
      affectedRows: invalidHoldings.map((h) => h.shareholder),
      suggestion: isValid
        ? undefined
        : 'Create missing share classes or correct shareholder/class assignments',
    };
  },
};

/**
 * Collection of all validation rules organized by category
 */
export const allValidationRules = {
  shareConservation: shareConservationRules,
  currencyConsistency: currencyConsistencyRules,
  waterfall: waterfallRules,
  dilution: dilutionRules,
  vesting: vestingRules,
  warrant: warrantRules,
  consolidation: consolidationRules,
};
