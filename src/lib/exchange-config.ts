/**
 * Exchange Configuration Module
 * 
 * Defines requirements and specifications for major North American and US exchanges.
 * Used for IPO readiness validation and compliance checking.
 */

/**
 * Prospectus format types supported by exchanges
 */
export type ProspectusFormat = 'S-1' | 'SB-2' | 'S-3' | 'F-1' | 'F-3' | 'F-10' | 'NI 41-101';

/**
 * Required resolution types for corporate governance
 */
export type ResolutionType = 
  | 'board-approval'
  | 'shareholder-approval'
  | 'share-split'
  | 'articles-amendment'
  | 'name-approval'
  | 'certificate-authorization'
  | 'directors-election'
  | 'audit-committee-approval'
  | 'underwriter-selection'
  | 'pricing-approval';

/**
 * Required consent types from stakeholders
 */
export type ConsentType =
  | 'board-consent'
  | 'shareholder-consent'
  | 'underwriter-consent'
  | 'legal-counsel-consent'
  | 'auditor-consent'
  | 'sec-comment-resolution'
  | 'securities-counsel-consent'
  | 'senior-lender-consent'
  | 'material-contract-consent';

/**
 * Core interface for exchange-specific configuration
 */
export interface ExchangeConfig {
  /** Unique identifier for the exchange */
  id: string;
  
  /** Display name of the exchange */
  name: string;
  
  /** 3-letter exchange code (e.g., TSX, NSD) */
  code: string;
  
  /** Country of operation */
  country: 'CA' | 'US';
  
  /** Regulatory body overseeing the exchange */
  regulator: string;
  
  /** Minimum public float required (%) */
  minPublicFloat: number;
  
  /** Standard board lot size (number of shares) */
  boardLot: number;
  
  /** Minimum number of shares outstanding */
  minShares: number;
  
  /** Greenshoe option maximum (% of offering) */
  greenShoe: number;
  
  /** Prospectus format(s) accepted */
  prospectusFormat: ProspectusFormat[];
  
  /** Required corporate resolutions */
  requiredResolutions: ResolutionType[];
  
  /** Required stakeholder consents */
  requiredConsents: ConsentType[];
  
  /** CUSIP identifier support */
  cusipSupported: boolean;
  
  /** ISIN requirement flag */
  isinRequired: boolean;
  
  /** Minimum listing standards tier */
  listingTier: 'standard' | 'emerging' | 'venture' | 'otc';
  
  /** Indicates if this is a Canadian exchange */
  isCanadian: boolean;
}

/**
 * TSX (Toronto Stock Exchange) Configuration
 * Canada's primary equities exchange
 */
export const TSX: ExchangeConfig = {
  id: 'tsx',
  name: 'Toronto Stock Exchange',
  code: 'TSX',
  country: 'CA',
  regulator: 'Ontario Securities Commission (OSC)',
  minPublicFloat: 15,
  boardLot: 100,
  minShares: 3000000,
  greenShoe: 15,
  prospectusFormat: ['F-10', 'NI 41-101'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'share-split',
    'articles-amendment',
    'name-approval',
    'certificate-authorization',
    'directors-election',
    'audit-committee-approval',
    'underwriter-selection',
    'pricing-approval'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'underwriter-consent',
    'legal-counsel-consent',
    'auditor-consent'
  ],
  cusipSupported: true,
  isinRequired: true,
  listingTier: 'standard',
  isCanadian: true
};

/**
 * NASDAQ Configuration
 * US technology and growth-focused exchange
 */
export const NASDAQ: ExchangeConfig = {
  id: 'nasdaq',
  name: 'NASDAQ Stock Market',
  code: 'NSD',
  country: 'US',
  regulator: 'Securities and Exchange Commission (SEC)',
  minPublicFloat: 5,
  boardLot: 100,
  minShares: 1000000,
  greenShoe: 15,
  prospectusFormat: ['S-1', 'SB-2', 'S-3', 'F-1', 'F-3'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'share-split',
    'articles-amendment',
    'name-approval',
    'directors-election',
    'audit-committee-approval',
    'underwriter-selection',
    'pricing-approval'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'underwriter-consent',
    'legal-counsel-consent',
    'auditor-consent',
    'sec-comment-resolution'
  ],
  cusipSupported: true,
  isinRequired: true,
  listingTier: 'standard',
  isCanadian: false
};

/**
 * NYSE (New York Stock Exchange) Configuration
 * World's largest equity exchange
 */
export const NYSE: ExchangeConfig = {
  id: 'nyse',
  name: 'New York Stock Exchange',
  code: 'NYS',
  country: 'US',
  regulator: 'Securities and Exchange Commission (SEC)',
  minPublicFloat: 10,
  boardLot: 100,
  minShares: 2000000,
  greenShoe: 15,
  prospectusFormat: ['S-1', 'SB-2', 'S-3', 'F-1', 'F-3'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'share-split',
    'articles-amendment',
    'name-approval',
    'directors-election',
    'audit-committee-approval',
    'underwriter-selection',
    'pricing-approval'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'underwriter-consent',
    'legal-counsel-consent',
    'auditor-consent',
    'securities-counsel-consent',
    'sec-comment-resolution',
    'senior-lender-consent'
  ],
  cusipSupported: true,
  isinRequired: true,
  listingTier: 'standard',
  isCanadian: false
};

/**
 * TSXV (TSX Venture Exchange) Configuration
 * Canadian venture capital and emerging company exchange
 */
export const TSXV: ExchangeConfig = {
  id: 'tsxv',
  name: 'TSX Venture Exchange',
  code: 'TSXV',
  country: 'CA',
  regulator: 'British Columbia Securities Commission (BCSC)',
  minPublicFloat: 10,
  boardLot: 1000,
  minShares: 500000,
  greenShoe: 20,
  prospectusFormat: ['NI 41-101'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'articles-amendment',
    'name-approval',
    'certificate-authorization',
    'directors-election',
    'underwriter-selection',
    'pricing-approval'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'underwriter-consent',
    'legal-counsel-consent',
    'auditor-consent'
  ],
  cusipSupported: true,
  isinRequired: true,
  listingTier: 'venture',
  isCanadian: true
};

/**
 * CSE (Canadian Securities Exchange) Configuration
 * Canadian exchange for smaller and emerging companies
 */
export const CSE: ExchangeConfig = {
  id: 'cse',
  name: 'Canadian Securities Exchange',
  code: 'CSE',
  country: 'CA',
  regulator: 'Ontario Securities Commission (OSC)',
  minPublicFloat: 10,
  boardLot: 1000,
  minShares: 250000,
  greenShoe: 25,
  prospectusFormat: ['NI 41-101'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'articles-amendment',
    'name-approval',
    'directors-election',
    'underwriter-selection',
    'pricing-approval'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'underwriter-consent',
    'legal-counsel-consent',
    'auditor-consent'
  ],
  cusipSupported: true,
  isinRequired: true,
  listingTier: 'emerging',
  isCanadian: true
};

/**
 * CBOE (Cboe BZX Exchange) Configuration
 * US exchange for equities and options
 */
export const CBOE: ExchangeConfig = {
  id: 'cboe',
  name: 'Cboe BZX Exchange',
  code: 'BZX',
  country: 'US',
  regulator: 'Securities and Exchange Commission (SEC)',
  minPublicFloat: 5,
  boardLot: 100,
  minShares: 500000,
  greenShoe: 15,
  prospectusFormat: ['S-1', 'SB-2', 'S-3', 'F-1', 'F-3'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'share-split',
    'articles-amendment',
    'name-approval',
    'directors-election',
    'audit-committee-approval',
    'underwriter-selection',
    'pricing-approval'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'underwriter-consent',
    'legal-counsel-consent',
    'auditor-consent',
    'sec-comment-resolution'
  ],
  cusipSupported: true,
  isinRequired: true,
  listingTier: 'standard',
  isCanadian: false
};

/**
 * OTC (Over-The-Counter) Configuration
 * US alternative trading system for micro-cap and development stage companies
 */
export const OTC: ExchangeConfig = {
  id: 'otc',
  name: 'OTC Markets (Pink Sheets)',
  code: 'OTC',
  country: 'US',
  regulator: 'Financial Industry Regulatory Authority (FINRA)',
  minPublicFloat: 1,
  boardLot: 10000,
  minShares: 100000,
  greenShoe: 25,
  prospectusFormat: ['SB-2'],
  requiredResolutions: [
    'board-approval',
    'shareholder-approval',
    'name-approval',
    'directors-election'
  ],
  requiredConsents: [
    'board-consent',
    'shareholder-consent',
    'legal-counsel-consent'
  ],
  cusipSupported: true,
  isinRequired: false,
  listingTier: 'otc',
  isCanadian: false
};

/**
 * Map of all exchange configurations by ID
 */
export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  tsx: TSX,
  nasdaq: NASDAQ,
  nyse: NYSE,
  tsxv: TSXV,
  cse: CSE,
  cboe: CBOE,
  otc: OTC
};

/**
 * Array of all exchange configurations
 */
export const ALL_EXCHANGES: ExchangeConfig[] = [
  TSX,
  NASDAQ,
  NYSE,
  TSXV,
  CSE,
  CBOE,
  OTC
];

/**
 * Get exchange configuration by ID
 * @param exchangeId - The exchange identifier
 * @returns The exchange configuration or undefined if not found
 */
export function getExchangeConfig(exchangeId: string): ExchangeConfig | undefined {
  return EXCHANGE_CONFIGS[exchangeId.toLowerCase()];
}

/**
 * Get all Canadian exchanges
 * @returns Array of Canadian exchange configurations
 */
export function getCanadianExchanges(): ExchangeConfig[] {
  return ALL_EXCHANGES.filter(exchange => exchange.isCanadian);
}

/**
 * Get all US exchanges
 * @returns Array of US exchange configurations
 */
export function getUSExchanges(): ExchangeConfig[] {
  return ALL_EXCHANGES.filter(exchange => !exchange.isCanadian);
}

/**
 * Validate if a company meets minimum requirements for an exchange
 * @param publicFloat - Company's public float percentage
 * @param sharesOutstanding - Number of shares outstanding
 * @param exchangeId - Target exchange identifier
 * @returns Object with validation results
 */
export function validateExchangeRequirements(
  publicFloat: number,
  sharesOutstanding: number,
  exchangeId: string
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const exchange = getExchangeConfig(exchangeId);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!exchange) {
    return {
      isValid: false,
      errors: [`Exchange not found: ${exchangeId}`],
      warnings: []
    };
  }

  if (publicFloat < exchange.minPublicFloat) {
    errors.push(
      `Public float (${publicFloat}%) below ${exchange.name} minimum (${exchange.minPublicFloat}%)`
    );
  }

  if (sharesOutstanding < exchange.minShares) {
    errors.push(
      `Shares outstanding (${sharesOutstanding}) below ${exchange.name} minimum (${exchange.minShares})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
