/**
 * Cap Table Excel Parser
 * Handles parsing of Excel-based cap table documents with support for
 * multiple templates and formats
 */

import * as XLSX from 'xlsx';
import {
  CapTableParser,
  ParserError,
  ParserWarning,
  ParsedShareClass,
  ParsedShareholder,
  ParsedHolding,
  ParsedVestingSchedule,
  ParsedTransaction,
  ParsedWarrant,
  ParsedPerformanceShare,
  ParsedAssumptions,
} from './parser';

interface SheetMapping {
  assumptions?: string;
  shareClasses?: string;
  shareholders?: string;
  holdings?: string;
  vesting?: string;
  transactions?: string;
  warrants?: string;
  performanceShares?: string;
}

export class ExcelCapTableParser extends CapTableParser {
  private workbook: XLSX.WorkBook | null = null;
  private sheetMapping: SheetMapping = {};
  private filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
  }

  /**
   * Initialize parser with Excel file
   */
  async initialize(): Promise<void> {
    try {
      const file = require('fs').readFileSync(this.filePath);
      this.workbook = XLSX.read(file, { cellDates: true });
      this.detectSheetMapping();
    } catch (error) {
      this.addError('initialize', `Failed to read Excel file: ${error instanceof Error ? error.message : String(error)}`, 'critical');
    }
  }

  /**
   * Detect which sheets contain which data types
   */
  private detectSheetMapping(): void {
    if (!this.workbook) return;

    const sheetNames = this.workbook.SheetNames;

    // Common patterns for sheet names
    const patterns = {
      assumptions: /^(summary|assumptions|overview|cap.?table|snapshot)$/i,
      shareClasses: /^(share.?class|classes|structure|security)$/i,
      shareholders: /^(shareholder|shareholders|party|parties)$/i,
      holdings: /^(holding|holdings|capitalization|cap|ownership)$/i,
      vesting: /^(vesting|vest|schedule)$/i,
      transactions: /^(transaction|transactions|activity|history)$/i,
      warrants: /^(warrant|warrants|option|options)$/i,
      performanceShares: /^(performance|rsu|restricted)$/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const matchedSheet = sheetNames.find((name) => pattern.test(name));
      if (matchedSheet) {
        this.sheetMapping[key as keyof SheetMapping] = matchedSheet;
      }
    }

    if (Object.keys(this.sheetMapping).length === 0) {
      this.addWarning('No standard sheet names detected. Will attempt to parse first non-empty sheet as main cap table.');
      const firstSheet = sheetNames[0];
      if (firstSheet) {
        this.sheetMapping.holdings = firstSheet;
      }
    }
  }

  /**
   * Get worksheet data as array of objects
   */
  private getSheetData(sheetName: string | undefined): Record<string, unknown>[] {
    if (!sheetName || !this.workbook) return [];

    try {
      const sheet = this.workbook.Sheets[sheetName];
      if (!sheet) {
        this.addWarning(`Sheet "${sheetName}" not found`);
        return [];
      }

      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    } catch (error) {
      this.addWarning(`Error reading sheet "${sheetName}": ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Parse assumptions
   */
  async parseAssumptions(): Promise<ParsedAssumptions> {
    const data = this.getSheetData(this.sheetMapping.assumptions);
    const assumptions: ParsedAssumptions = {};

    if (data.length === 0) {
      this.addWarning('No assumptions sheet found. Using defaults.', 'Try adding a "Summary" or "Assumptions" sheet');
      return assumptions;
    }

    // Try to find key-value pairs (common in summary sheets)
    const firstRow = data[0];

    for (const [key, value] of Object.entries(firstRow)) {
      const normalizedKey = this.normalizeString(key).toLowerCase();

      if (normalizedKey.includes('company') && normalizedKey.includes('name')) {
        assumptions.company_name = this.normalizeString(value);
      } else if (normalizedKey.includes('valuation') && normalizedKey.includes('date')) {
        assumptions.valuation_date = this.parseDate(value);
      } else if (normalizedKey.includes('valuation') || normalizedKey.includes('post.money')) {
        assumptions.post_money_valuation = this.parseNumber(value);
      } else if (normalizedKey.includes('outstanding') && normalizedKey.includes('share')) {
        assumptions.shares_outstanding = this.parseNumber(value);
      } else if (normalizedKey.includes('diluted') || normalizedKey.includes('fully.diluted')) {
        assumptions.shares_fully_diluted = this.parseNumber(value);
      } else if (normalizedKey.includes('price') || normalizedKey.includes('pps')) {
        assumptions.price_per_share = this.parseNumber(value);
      } else if (normalizedKey.includes('currency')) {
        assumptions.currency = this.normalizeString(value).toUpperCase();
      }
    }

    return assumptions;
  }

  /**
   * Parse share classes
   */
  async parseShareClasses(): Promise<ParsedShareClass[]> {
    const data = this.getSheetData(this.sheetMapping.shareClasses);
    const shareClasses: ParsedShareClass[] = [];

    if (data.length === 0) {
      this.addWarning('No share classes sheet found. Assuming Common and Preferred Series.');
      return [
        {
          class_name: 'Common',
          preference_order: 0,
          conversion_ratio: 1,
          voting_rights: 1,
        },
        {
          class_name: 'Series A Preferred',
          preference_order: 1,
          conversion_ratio: 1,
          voting_rights: 1,
        },
      ];
    }

    for (const row of data) {
      const className = this.normalizeString(row['Class Name'] || row['Share Class'] || row['Class']);
      if (!className) continue;

      const shareClass: ParsedShareClass = {
        class_name: className,
        class_code: this.normalizeString(row['Code'] || row['Class Code'] || className.charAt(0)),
        preference_order: this.parseNumber(row['Preference Order'] || row['Priority'] || 0) ?? 0,
        liquidation_preference_multiplier: this.parseNumber(row['Liquidation Preference'] || 1),
        participating: this.parseBoolean(row['Participating'] || false),
        conversion_ratio: this.parseNumber(row['Conversion Ratio'] || 1),
        voting_rights: this.parseNumber(row['Votes Per Share'] || 1),
        dividend_per_share: this.parseNumber(row['Dividend Per Share']),
      };

      shareClasses.push(shareClass);
    }

    if (shareClasses.length === 0) {
      this.addError('shareClasses', 'No share classes could be parsed from the sheet', 'error');
    }

    return shareClasses;
  }

  /**
   * Parse shareholders
   */
  async parseShareholders(): Promise<ParsedShareholder[]> {
    const data = this.getSheetData(this.sheetMapping.shareholders);
    const shareholders: ParsedShareholder[] = [];
    const seen = new Set<string>();

    if (data.length === 0) {
      this.addWarning('No shareholders sheet found. Will extract shareholders from holdings.');
      return shareholders;
    }

    for (const row of data) {
      const name = this.normalizeString(row['Name'] || row['Shareholder'] || row['Party']);
      if (!name || seen.has(name.toLowerCase())) continue;

      seen.add(name.toLowerCase());

      const shareholder: ParsedShareholder = {
        shareholder_name: name,
        shareholder_type: this.normalizeString(row['Type'] || row['Shareholder Type'] || '').toLowerCase() as any,
        entity_type: this.normalizeString(row['Entity Type'] || row['Legal Structure'] || '').toLowerCase() as any,
        identifier: this.normalizeString(row['ID'] || row['Identifier'] || row['SSN/SIN']),
        country_incorporation: this.normalizeString(row['Country'] || row['Jurisdiction']).toUpperCase().slice(0, 2),
        notes: this.normalizeString(row['Notes'] || row['Comments']),
      };

      shareholders.push(shareholder);
    }

    return shareholders;
  }

  /**
   * Parse holdings
   */
  async parseHoldings(): Promise<ParsedHolding[]> {
    const data = this.getSheetData(this.sheetMapping.holdings);
    const holdings: ParsedHolding[] = [];

    if (data.length === 0) {
      this.addError('holdings', 'No holdings data found', 'critical');
      return holdings;
    }

    for (const row of data) {
      const shareholderName = this.normalizeString(row['Shareholder'] || row['Name'] || row['Party']);
      const shareClassName = this.normalizeString(row['Share Class'] || row['Class'] || row['Security']);

      if (!shareholderName || !shareClassName) continue;

      const quantity = this.parseNumber(row['Shares'] || row['Quantity'] || row['Qty']);
      if (quantity === undefined) continue;

      const holding: ParsedHolding = {
        shareholder_name: shareholderName,
        share_class_name: shareClassName,
        quantity: quantity,
        quantity_issued: this.parseNumber(row['Issued'] || row['Total'] || quantity) ?? quantity,
        cost_per_share: this.parseNumber(row['Cost Per Share'] || row['Strike Price']),
        total_cost: this.parseNumber(row['Total Cost'] || row['Investment Amount']),
        currency: this.normalizeString(row['Currency'] || 'USD').toUpperCase(),
        holding_type: this.normalizeString(row['Type'] || row['Holding Type'] || 'common').toLowerCase() as any,
        grant_date: this.parseDate(row['Grant Date'] || row['Date']),
        exercise_price: this.parseNumber(row['Exercise Price'] || row['Strike']),
        expiration_date: this.parseDate(row['Expiration'] || row['Expiration Date']),
        notes: this.normalizeString(row['Notes'] || row['Comments']),
      };

      holdings.push(holding);
    }

    if (holdings.length === 0) {
      this.addError('holdings', 'No valid holdings could be parsed', 'critical');
    }

    return holdings;
  }

  /**
   * Parse vesting schedules
   */
  async parseVestingSchedules(): Promise<ParsedVestingSchedule[]> {
    const data = this.getSheetData(this.sheetMapping.vesting);
    const schedules: ParsedVestingSchedule[] = [];

    if (data.length === 0) {
      this.addWarning('No vesting schedules found. Assuming all shares are fully vested.');
      return schedules;
    }

    for (const row of data) {
      const shareholderName = this.normalizeString(row['Shareholder'] || row['Name']);
      const shareClassName = this.normalizeString(row['Share Class'] || row['Class']);
      const vestingStartDate = this.parseDate(row['Vesting Start'] || row['Start Date']);
      const vestingEndDate = this.parseDate(row['Vesting End'] || row['End Date']);

      if (!shareholderName || !shareClassName || !vestingStartDate || !vestingEndDate) continue;

      const schedule: ParsedVestingSchedule = {
        shareholder_name: shareholderName,
        share_class_name: shareClassName,
        vesting_start_date: vestingStartDate,
        vesting_end_date: vestingEndDate,
        cliff_months: this.parseNumber(row['Cliff Months'] || row['Cliff']) ?? 0,
        total_vesting_months: this.parseNumber(row['Total Vesting Months'] || row['Vesting Period']) ?? 48,
        vesting_frequency: this.normalizeString(row['Frequency'] || 'monthly').toLowerCase() as any,
        vesting_percent_on_cliff: this.parseNumber(row['Cliff %'] || row['Cliff Percent']),
        acceleration_on_change_of_control: this.parseBoolean(row['Change of Control'] || false),
        acceleration_on_termination: this.parseBoolean(row['Termination Acceleration'] || false),
        single_trigger_acceleration: this.parseNumber(row['Single Trigger %']),
        double_trigger_acceleration: this.parseNumber(row['Double Trigger %']),
      };

      schedules.push(schedule);
    }

    return schedules;
  }

  /**
   * Parse transactions
   */
  async parseTransactions(): Promise<ParsedTransaction[]> {
    const data = this.getSheetData(this.sheetMapping.transactions);
    const transactions: ParsedTransaction[] = [];

    if (data.length === 0) {
      this.addWarning('No transaction history found.');
      return transactions;
    }

    let waterfall_order = 1;
    for (const row of data) {
      const transactionDate = this.parseDate(row['Date'] || row['Transaction Date']);
      const transactionType = this.normalizeString(row['Type'] || row['Transaction Type']).toLowerCase();

      if (!transactionDate || !transactionType) continue;

      const quantity_before = this.parseNumber(row['Before'] || row['Qty Before']);
      const quantity_after = this.parseNumber(row['After'] || row['Qty After']);
      let quantity_change = this.parseNumber(row['Change'] || row['Qty Change']);

      if (quantity_change === undefined && quantity_before !== undefined && quantity_after !== undefined) {
        quantity_change = quantity_after - quantity_before;
      }

      if (quantity_change === undefined) continue;

      const transaction: ParsedTransaction = {
        transaction_date: transactionDate,
        transaction_type: transactionType as any,
        share_class_name: this.normalizeString(row['Share Class'] || row['Class']),
        shareholder_name: this.normalizeString(row['Shareholder'] || row['Name']),
        quantity_before: quantity_before,
        quantity_after: quantity_after,
        quantity_change: quantity_change,
        price_per_share: this.parseNumber(row['Price'] || row['Price Per Share']),
        transaction_value: this.parseNumber(row['Value'] || row['Total Value']),
        currency: this.normalizeString(row['Currency'] || 'USD').toUpperCase(),
        description: this.normalizeString(row['Description'] || row['Notes']),
      };

      transactions.push(transaction);
      waterfall_order++;
    }

    return transactions;
  }

  /**
   * Parse warrants
   */
  async parseWarrants(): Promise<ParsedWarrant[]> {
    const data = this.getSheetData(this.sheetMapping.warrants);
    const warrants: ParsedWarrant[] = [];

    if (data.length === 0) {
      this.addWarning('No warrants found.');
      return warrants;
    }

    for (const row of data) {
      const shareholderName = this.normalizeString(row['Shareholder'] || row['Name']);
      const quantity = this.parseNumber(row['Quantity'] || row['Qty'] || row['Shares']);
      const exercisePrice = this.parseNumber(row['Exercise Price'] || row['Strike'] || row['Price']);

      if (!shareholderName || quantity === undefined || exercisePrice === undefined) continue;

      const warrant: ParsedWarrant = {
        shareholder_name: shareholderName,
        quantity: quantity,
        exercise_price: exercisePrice,
        expiration_date: this.parseDate(row['Expiration'] || row['Expiration Date']),
        currency: this.normalizeString(row['Currency'] || 'USD').toUpperCase(),
        notes: this.normalizeString(row['Notes'] || row['Comments']),
      };

      warrants.push(warrant);
    }

    return warrants;
  }

  /**
   * Parse performance shares
   */
  async parsePerformanceShares(): Promise<ParsedPerformanceShare[]> {
    const data = this.getSheetData(this.sheetMapping.performanceShares);
    const performanceShares: ParsedPerformanceShare[] = [];

    if (data.length === 0) {
      this.addWarning('No performance shares found.');
      return performanceShares;
    }

    for (const row of data) {
      const shareholderName = this.normalizeString(row['Shareholder'] || row['Name']);
      const shareClassName = this.normalizeString(row['Share Class'] || row['Class']);
      const quantity = this.parseNumber(row['Quantity'] || row['Qty']);

      if (!shareholderName || !shareClassName || quantity === undefined) continue;

      const performanceShare: ParsedPerformanceShare = {
        shareholder_name: shareholderName,
        share_class_name: shareClassName,
        quantity: quantity,
        performance_condition: this.normalizeString(row['Condition'] || row['Performance Condition']),
        achievement_date: this.parseDate(row['Achievement Date']),
        notes: this.normalizeString(row['Notes']),
      };

      performanceShares.push(performanceShare);
    }

    return performanceShares;
  }
}
