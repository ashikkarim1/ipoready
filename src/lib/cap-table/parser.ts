/**
 * Cap Table Parser - Abstract Base Class
 * Defines the contract for all cap table document parsers
 */

export interface ParsedShareClass {
  class_name: string;
  class_code?: string;
  preference_order: number;
  liquidation_preference_multiplier?: number;
  participating?: boolean;
  conversion_ratio?: number;
  voting_rights?: number;
  dividend_per_share?: number;
  liquidation_per_share?: number;
}

export interface ParsedShareholder {
  shareholder_name: string;
  shareholder_type?: 'founder' | 'investor' | 'employee' | 'advisor' | 'consultant';
  entity_type?: 'individual' | 'corporation' | 'trust' | 'partnership';
  identifier?: string;
  country_incorporation?: string;
  notes?: string;
}

export interface ParsedHolding {
  shareholder_name: string;
  share_class_name: string;
  quantity: number;
  quantity_issued: number;
  cost_per_share?: number;
  total_cost?: number;
  currency?: string;
  holding_type?: 'common' | 'preferred' | 'option' | 'warrant' | 'convertible';
  grant_date?: Date;
  exercise_price?: number;
  expiration_date?: Date;
  notes?: string;
}

export interface ParsedVestingSchedule {
  shareholder_name: string;
  share_class_name: string;
  vesting_start_date: Date;
  vesting_end_date: Date;
  cliff_months: number;
  total_vesting_months: number;
  vesting_frequency?: 'monthly' | 'quarterly' | 'annually';
  vesting_percent_on_cliff?: number;
  acceleration_on_change_of_control?: boolean;
  acceleration_on_termination?: boolean;
  single_trigger_acceleration?: number;
  double_trigger_acceleration?: number;
}

export interface ParsedTransaction {
  transaction_date: Date;
  transaction_type: 'grant' | 'issuance' | 'exercise' | 'conversion' | 'split' | 'cancellation';
  share_class_name?: string;
  shareholder_name?: string;
  quantity_before?: number;
  quantity_after?: number;
  quantity_change: number;
  price_per_share?: number;
  transaction_value?: number;
  currency?: string;
  description: string;
}

export interface ParsedWarrant {
  shareholder_name: string;
  quantity: number;
  exercise_price: number;
  expiration_date?: Date;
  currency?: string;
  notes?: string;
}

export interface ParsedPerformanceShare {
  shareholder_name: string;
  share_class_name: string;
  quantity: number;
  performance_condition: string;
  achievement_date?: Date;
  notes?: string;
}

export interface ParsedAssumptions {
  company_name?: string;
  valuation_date?: Date;
  post_money_valuation?: number;
  shares_outstanding?: number;
  shares_fully_diluted?: number;
  price_per_share?: number;
  currency?: string;
  notes?: string;
}

export interface ParserResult {
  assumptions: ParsedAssumptions;
  shareClasses: ParsedShareClass[];
  shareholders: ParsedShareholder[];
  holdings: ParsedHolding[];
  vestingSchedules: ParsedVestingSchedule[];
  transactions: ParsedTransaction[];
  warrants: ParsedWarrant[];
  performanceShares: ParsedPerformanceShare[];
  errors: ParserError[];
  warnings: ParserWarning[];
}

export interface ParserError {
  type: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  location?: string;
}

export interface ParserWarning {
  message: string;
  suggestion?: string;
  location?: string;
}

/**
 * Abstract base class for all cap table parsers
 */
export abstract class CapTableParser {
  protected errors: ParserError[] = [];
  protected warnings: ParserWarning[] = [];

  /**
   * Parse cap table assumptions (valuation, shares, etc.)
   */
  abstract parseAssumptions(): Promise<ParsedAssumptions>;

  /**
   * Parse share classes
   */
  abstract parseShareClasses(): Promise<ParsedShareClass[]>;

  /**
   * Parse shareholders
   */
  abstract parseShareholders(): Promise<ParsedShareholder[]>;

  /**
   * Parse holdings (share ownership)
   */
  abstract parseHoldings(): Promise<ParsedHolding[]>;

  /**
   * Parse transactions
   */
  abstract parseTransactions(): Promise<ParsedTransaction[]>;

  /**
   * Parse warrants
   */
  abstract parseWarrants(): Promise<ParsedWarrant[]>;

  /**
   * Parse vesting schedules
   */
  abstract parseVestingSchedules(): Promise<ParsedVestingSchedule[]>;

  /**
   * Parse performance shares / RSUs
   */
  abstract parsePerformanceShares(): Promise<ParsedPerformanceShare[]>;

  /**
   * Main parse method - orchestrates all parsing
   */
  async parse(): Promise<ParserResult> {
    this.errors = [];
    this.warnings = [];

    try {
      const [assumptions, shareClasses, shareholders, holdings, vestingSchedules, transactions, warrants, performanceShares] = await Promise.all([
        this.parseAssumptions(),
        this.parseShareClasses(),
        this.parseShareholders(),
        this.parseHoldings(),
        this.parseVestingSchedules(),
        this.parseTransactions(),
        this.parseWarrants(),
        this.parsePerformanceShares(),
      ]);

      return {
        assumptions,
        shareClasses,
        shareholders,
        holdings,
        vestingSchedules,
        transactions,
        warrants,
        performanceShares,
        errors: this.errors,
        warnings: this.warnings,
      };
    } catch (error) {
      this.addError('parse', `Fatal parsing error: ${error instanceof Error ? error.message : String(error)}`, 'critical');
      return {
        assumptions: {},
        shareClasses: [],
        shareholders: [],
        holdings: [],
        vestingSchedules: [],
        transactions: [],
        warrants: [],
        performanceShares: [],
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  /**
   * Helper: Add error
   */
  protected addError(type: string, message: string, severity: 'critical' | 'error' | 'warning' = 'error', location?: string) {
    this.errors.push({ type, message, severity, location });
  }

  /**
   * Helper: Add warning
   */
  protected addWarning(message: string, suggestion?: string, location?: string) {
    this.warnings.push({ message, suggestion, location });
  }

  /**
   * Helper: Parse date flexibly
   */
  protected parseDate(value: unknown): Date | undefined {
    if (!value) return undefined;

    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value); // Excel date number
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }

    return undefined;
  }

  /**
   * Helper: Parse number
   */
  protected parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Helper: Parse boolean
   */
  protected parseBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', 'yes', '1', 'y', 'on'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') return value !== 0;
    return false;
  }

  /**
   * Helper: Trim and normalize string
   */
  protected normalizeString(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }
}
