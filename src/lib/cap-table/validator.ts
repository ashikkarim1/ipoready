/**
 * Cap Table Validator - Rule Execution Engine
 * Validates cap table data against all registered validation rules
 */

import { ValidationResult, ValidationSeverity } from './validation-rules';
import {
  shareConservationRules,
  currencyConsistencyRules,
  waterfallRules,
  dilutionRules,
  vestingRules,
  warrantRules,
  consolidationRules,
  allValidationRules,
} from './validation-rules';

export interface CapTableData {
  holdings: Array<{
    shareholder: string;
    shareClass: string;
    quantity: number;
    quantityIssued: number;
    vestedQuantity?: number;
    currency?: string;
    grantDate?: Date;
    exercisePrice?: number;
    expirationDate?: Date;
  }>;
  shareClasses: Array<{
    name: string;
    preferenceOrder: number;
    liquidationPreferenceMultiplier?: number;
  }>;
  vesting?: Array<{
    shareholder: string;
    shareClass: string;
    vestingStart: Date;
    cliffDate?: Date;
    vestingEnd: Date;
    cliffPercent?: number;
  }>;
  transactions?: Array<{
    date: Date;
    type: string;
    shareholder?: string;
    shareClass?: string;
    quantityChange: number;
  }>;
  authorizedShares?: number;
  totalIssued?: number;
  documentName?: string;
}

export interface ValidationReport {
  documentName: string;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  results: ValidationResult[];
  summary: string;
  timestamp: Date;
}

/**
 * Validator class orchestrates all validation rules
 */
export class CapTableValidator {
  /**
   * Validate cap table data
   */
  async validate(data: CapTableData): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    const documentName = data.documentName || 'Cap Table Document';

    // Run all validation categories
    results.push(...this.validateShareConservation(data));
    results.push(...this.validateCurrencyConsistency(data));
    results.push(...this.validateWaterfall(data));
    results.push(...this.validateDilution(data));
    results.push(...this.validateVesting(data));
    results.push(...this.validateWarrants(data));
    results.push(...this.validateConsolidation(data));

    // Count severities
    const errorCount = results.filter((r) => r.severity === 'error' && !r.isValid).length;
    const warningCount = results.filter((r) => r.severity === 'warning' && !r.isValid).length;
    const infoCount = results.filter((r) => r.severity === 'info' || r.isValid).length;

    const isValid = errorCount === 0;

    return {
      documentName,
      isValid,
      errorCount,
      warningCount,
      infoCount,
      results: results.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      summary: this.generateSummary(isValid, errorCount, warningCount, infoCount),
      timestamp: new Date(),
    };
  }

  /**
   * Validate share conservation rules
   */
  private validateShareConservation(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Rule 1.1: Authorized vs Issued
    if (data.authorizedShares && data.totalIssued) {
      results.push(
        shareConservationRules.authorizedVsIssued(data.totalIssued, data.authorizedShares)
      );
    }

    // Rule 1.2: Vesting Consistency
    for (const holding of data.holdings) {
      const vested = holding.vestedQuantity ?? holding.quantity;
      if (vested > 0) {
        results.push(
          shareConservationRules.vestingConsistency(
            vested,
            holding.quantityIssued,
            holding.shareholder
          )
        );
      }
    }

    return results;
  }

  /**
   * Validate currency consistency rules
   */
  private validateCurrencyConsistency(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    const currencies = data.holdings
      .map((h) => h.currency || 'USD')
      .filter((c) => c);

    results.push(
      currencyConsistencyRules.singleDocumentCurrency(
        currencies,
        data.documentName || 'Cap Table'
      )
    );

    return results;
  }

  /**
   * Validate waterfall rules
   */
  private validateWaterfall(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    const preferences = data.shareClasses.map((sc) => ({
      name: sc.name,
      preferenceOrder: sc.preferenceOrder,
    }));

    results.push(waterfallRules.liquidationPreferenceOrder(preferences));

    return results;
  }

  /**
   * Validate dilution rules
   */
  private validateDilution(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Calculate ownership percentages
    const totalShares = data.holdings.reduce((sum, h) => sum + h.quantity, 0);

    if (totalShares > 0) {
      const holdings = data.holdings
        .filter((h) => h.quantity > 0)
        .map((h) => ({
          name: h.shareholder,
          fdPercentage: (h.quantity / totalShares) * 100,
        }));

      results.push(dilutionRules.ownershipPercentageSum(holdings));

      // Check dilution for each holder
      for (const holding of data.holdings) {
        const currentOwnership = (holding.quantity / totalShares) * 100;
        // FD would include options, warrants, etc. For now use same as current
        const fdOwnership = currentOwnership;

        results.push(
          dilutionRules.dilutionTracking(
            currentOwnership,
            fdOwnership,
            holding.shareholder
          )
        );
      }
    }

    return results;
  }

  /**
   * Validate vesting rules
   */
  private validateVesting(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!data.vesting) return results;

    for (const schedule of data.vesting) {
      // Rule 5.1: Date sequence
      results.push(
        vestingRules.validDateSequence(
          schedule.vestingStart,
          schedule.cliffDate || null,
          schedule.vestingEnd,
          schedule.shareholder
        )
      );

      // Rule 5.2: Cliff percentage
      if (schedule.cliffPercent !== undefined) {
        results.push(
          vestingRules.cliffPercentage(schedule.cliffPercent, schedule.shareholder)
        );
      }
    }

    return results;
  }

  /**
   * Validate warrant rules
   */
  private validateWarrants(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const holding of data.holdings) {
      if (holding.exercisePrice !== undefined && holding.exercisePrice > 0) {
        // Rule 6.1: Exercise price
        results.push(
          warrantRules.exercisePriceValidation(
            holding.exercisePrice,
            holding.shareClass,
            holding.shareholder
          )
        );

        // Rule 6.2: Expiration
        if (holding.expirationDate) {
          results.push(
            warrantRules.warrantExpiration(holding.expirationDate, holding.shareholder)
          );
        }
      }
    }

    return results;
  }

  /**
   * Validate consolidation rules
   */
  private validateConsolidation(data: CapTableData): ValidationResult[] {
    const results: ValidationResult[] = [];

    const holdings = data.holdings.map((h) => ({
      shareholder: h.shareholder,
      shareClass: h.shareClass,
    }));

    // Rule 7.1: No duplicates
    results.push(consolidationRules.noDuplicateHoldings(holdings));

    // Rule 7.2: Share class consistency
    const validClasses = data.shareClasses.map((sc) => sc.name);
    const holdingClasses = [...new Set(data.holdings.map((h) => h.shareClass))];

    results.push(
      consolidationRules.shareClassConsistency(holdings, validClasses)
    );

    return results;
  }

  /**
   * Generate summary text
   */
  private generateSummary(
    isValid: boolean,
    errorCount: number,
    warningCount: number,
    infoCount: number
  ): string {
    if (isValid && warningCount === 0) {
      return 'Cap table is valid with no errors or warnings.';
    }

    const parts: string[] = [];

    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''} found`);
    }

    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''} found`);
    }

    return parts.length > 0
      ? `Cap table has issues: ${parts.join(', ')}.`
      : 'Validation complete.';
  }

  /**
   * Get validation errors only
   */
  static getErrors(report: ValidationReport): ValidationResult[] {
    return report.results.filter((r) => r.severity === 'error' && !r.isValid);
  }

  /**
   * Get validation warnings only
   */
  static getWarnings(report: ValidationReport): ValidationResult[] {
    return report.results.filter((r) => r.severity === 'warning' && !r.isValid);
  }

  /**
   * Get validation info only
   */
  static getInfo(report: ValidationReport): ValidationResult[] {
    return report.results.filter((r) => r.severity === 'info');
  }

  /**
   * Export report as JSON
   */
  static exportAsJSON(report: ValidationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as CSV
   */
  static exportAsCSV(report: ValidationReport): string {
    const headers = ['Rule', 'Severity', 'Valid', 'Message', 'Affected Rows'];
    const rows = report.results.map((r) => [
      r.rule,
      r.severity,
      r.isValid ? 'Yes' : 'No',
      r.message,
      (r.affectedRows || []).join('; '),
    ]);

    const lines = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    );

    return lines.join('\n');
  }
}
