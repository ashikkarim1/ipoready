/**
 * Exchange Registry - Master configuration for all supported exchanges
 * Add new exchange in <3 minutes: duplicate template, fill in details, done.
 */

export type ExchangeCode = 'TSX' | 'TSXV' | 'CSE' | 'NASDAQ' | 'NYSE' | 'OTCQX' | 'LSE' | 'DFM' | string

export type RegulatorCode = 'CSA' | 'SEC' | 'FCA' | 'DFSA' | string

export interface ExchangeConfig {
  // Exchange identifier
  code: ExchangeCode
  name: string
  country: string
  timezone: string

  // Regulatory info
  regulator: RegulatorCode
  regulatoryBody: string
  filingSystem: string  // e.g., "SEDAR2", "SEC Edgar", "RNS", "eServe"

  // Financial thresholds
  minPublicFloat: {
    amount: number
    currency: string
  }
  minMarketCap?: {
    amount: number
    currency: string
  }

  // Listing requirements
  minYearsProfitability?: number
  minShareholderCount?: number
  minIndependentDirectors?: number

  // Listed Services modules enabled/required
  enabledModules: string[]  // e.g., ['disclosure', 'ir', 'cfo', 'executive', 'compliance']
  mandatoryModules: string[]  // Must implement these

  // Regulatory documents required for listing
  requiredDocuments: string[]

  // Filing deadlines (days from listing)
  filingDeadlines: {
    firstQuarterlyReport: number
    firstAnnualReport: number
    continuousDisclosure: number
  }

  // Contact info for support
  apiEndpoint?: string
  supportEmail?: string

  // Status
  isLive: boolean
  launchedDate?: string
  notes?: string
}

/**
 * Master exchange registry - all supported exchanges
 *
 * ADDING A NEW EXCHANGE:
 * 1. Copy TEMPLATE below
 * 2. Fill in all fields
 * 3. Add to EXCHANGES object
 * 4. Run: npm run add-exchange -- --code=DFM --country=UAE
 * Done!
 */

const TEMPLATE: ExchangeConfig = {
  code: 'TEMPLATE',
  name: '[EXCHANGE NAME]',
  country: '[COUNTRY]',
  timezone: 'UTC+0',
  regulator: '[REGULATOR CODE]',
  regulatoryBody: '[Full regulatory body name]',
  filingSystem: '[Filing system name - e.g., SEDAR2, SEC Edgar]',
  minPublicFloat: {
    amount: 0,
    currency: 'USD'
  },
  minMarketCap: {
    amount: 0,
    currency: 'USD'
  },
  minYearsProfitability: 2,
  minShareholderCount: 500,
  minIndependentDirectors: 2,
  enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
  mandatoryModules: ['disclosure', 'compliance'],
  requiredDocuments: [
    'Prospectus',
    'Financial Statements',
    'Risk Factors',
    'Management Discussion & Analysis'
  ],
  filingDeadlines: {
    firstQuarterlyReport: 45,
    firstAnnualReport: 90,
    continuousDisclosure: 5
  },
  isLive: false,
  notes: 'Update this template with real data'
}

export const EXCHANGES: Record<ExchangeCode, ExchangeConfig> = {
  // CANADA
  TSX: {
    code: 'TSX',
    name: 'Toronto Stock Exchange',
    country: 'Canada',
    timezone: 'America/Toronto',
    regulator: 'CSA',
    regulatoryBody: 'Canadian Securities Administrators',
    filingSystem: 'SEDAR2',
    minPublicFloat: {
      amount: 4000000,
      currency: 'CAD'
    },
    minMarketCap: {
      amount: 10000000,
      currency: 'CAD'
    },
    minYearsProfitability: 2,
    minShareholderCount: 500,
    minIndependentDirectors: 2,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'ir', 'compliance'],
    requiredDocuments: [
      'Final Prospectus',
      'Audited Financial Statements',
      'MD&A',
      'Risk Factors',
      'Management Proxy Circular'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 90,
      continuousDisclosure: 5
    },
    apiEndpoint: 'https://api.sedar.com',
    supportEmail: 'support@sedar.com',
    isLive: true,
    launchedDate: '2024-01-01',
    notes: 'Primary Canadian exchange, most mature implementation'
  },

  TSXV: {
    code: 'TSXV',
    name: 'TSX Venture Exchange',
    country: 'Canada',
    timezone: 'America/Toronto',
    regulator: 'CSA',
    regulatoryBody: 'Canadian Securities Administrators',
    filingSystem: 'SEDAR2',
    minPublicFloat: {
      amount: 2000000,
      currency: 'CAD'
    },
    minYearsProfitability: 0,
    minShareholderCount: 300,
    minIndependentDirectors: 1,
    enabledModules: ['disclosure', 'ir', 'cfo', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Final Prospectus',
      'Financial Statements',
      'Management Discussion & Analysis',
      'Risk Factors'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 90,
      continuousDisclosure: 5
    },
    isLive: true,
    launchedDate: '2024-01-01',
    notes: 'Canadian venture exchange, relaxed requirements vs TSX'
  },

  CSE: {
    code: 'CSE',
    name: 'Canadian Securities Exchange',
    country: 'Canada',
    timezone: 'America/Toronto',
    regulator: 'CSA',
    regulatoryBody: 'Canadian Securities Administrators',
    filingSystem: 'SEDAR2',
    minPublicFloat: {
      amount: 1000000,
      currency: 'CAD'
    },
    minYearsProfitability: 0,
    minShareholderCount: 100,
    minIndependentDirectors: 0,
    enabledModules: ['disclosure', 'ir', 'compliance'],
    mandatoryModules: ['disclosure'],
    requiredDocuments: [
      'Listing Statement',
      'Financial Statements',
      'Risk Factors'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 90,
      continuousDisclosure: 5
    },
    isLive: true,
    notes: 'Canadian SME exchange, minimal requirements'
  },

  // USA
  NASDAQ: {
    code: 'NASDAQ',
    name: 'NASDAQ',
    country: 'United States',
    timezone: 'America/New_York',
    regulator: 'SEC',
    regulatoryBody: 'U.S. Securities and Exchange Commission',
    filingSystem: 'SEC Edgar',
    minPublicFloat: {
      amount: 110000000,
      currency: 'USD'
    },
    minMarketCap: {
      amount: 550000000,
      currency: 'USD'
    },
    minYearsProfitability: 2,
    minShareholderCount: 2000,
    minIndependentDirectors: 5,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'ir', 'cfo', 'compliance'],
    requiredDocuments: [
      'Form S-1',
      'Financial Statements (audited)',
      'MD&A',
      'Risk Factors',
      'Executive Compensation',
      'Corporate Governance'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 60,
      continuousDisclosure: 4
    },
    apiEndpoint: 'https://www.sec.gov/cgi-bin/browse-edgar',
    isLive: true,
    launchedDate: '2024-01-01',
    notes: 'Largest US exchange, most stringent requirements'
  },

  NYSE: {
    code: 'NYSE',
    name: 'New York Stock Exchange',
    country: 'United States',
    timezone: 'America/New_York',
    regulator: 'SEC',
    regulatoryBody: 'U.S. Securities and Exchange Commission',
    filingSystem: 'SEC Edgar',
    minPublicFloat: {
      amount: 110000000,
      currency: 'USD'
    },
    minMarketCap: {
      amount: 1000000000,
      currency: 'USD'
    },
    minYearsProfitability: 2,
    minShareholderCount: 2000,
    minIndependentDirectors: 5,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'ir', 'cfo', 'executive', 'compliance'],
    requiredDocuments: [
      'Form S-1',
      'Financial Statements (audited)',
      'MD&A',
      'Risk Factors',
      'Executive Compensation',
      'Corporate Governance',
      'Related Party Transactions'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 40,
      firstAnnualReport: 60,
      continuousDisclosure: 4
    },
    isLive: true,
    launchedDate: '2024-01-01',
    notes: 'Prestige exchange, highest market cap threshold'
  },

  // UK
  LSE: {
    code: 'LSE',
    name: 'London Stock Exchange',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    regulator: 'FCA',
    regulatoryBody: 'Financial Conduct Authority',
    filingSystem: 'RNS (Regulatory News Service)',
    minPublicFloat: {
      amount: 500000,
      currency: 'GBP'
    },
    minMarketCap: {
      amount: 5000000,
      currency: 'GBP'
    },
    minYearsProfitability: 3,
    minShareholderCount: 100,
    minIndependentDirectors: 2,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Prospectus',
      'Audited Accounts',
      'Directors Report',
      'Risk Factors',
      'Admission Document'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 90,
      firstAnnualReport: 120,
      continuousDisclosure: 2
    },
    supportEmail: 'support@lseg.com',
    isLive: false,
    notes: 'UK listing, RNS filing system. COMING SOON'
  },

  // UAE
  DFM: {
    code: 'DFM',
    name: 'Dubai Financial Market',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
    regulator: 'DFSA',
    regulatoryBody: 'Dubai Financial Services Authority',
    filingSystem: 'eServe',
    minPublicFloat: {
      amount: 3000000,
      currency: 'AED'
    },
    minMarketCap: {
      amount: 30000000,
      currency: 'AED'
    },
    minYearsProfitability: 2,
    minShareholderCount: 250,
    minIndependentDirectors: 1,
    enabledModules: ['disclosure', 'ir', 'cfo', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Prospectus',
      'Financial Statements',
      'Risk Factors',
      'Board Approval',
      'Sharia Compliance (if applicable)'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 90,
      continuousDisclosure: 3
    },
    supportEmail: 'listings@dfm.ae',
    isLive: false,
    notes: 'Middle East gateway. Enable when user requests Dubai listing'
  },

  // AUSTRALIA
  ASX: {
    code: 'ASX',
    name: 'Australian Securities Exchange',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    regulator: 'ASIC',
    regulatoryBody: 'Australian Securities and Investments Commission',
    filingSystem: 'ASX Listings',
    minPublicFloat: {
      amount: 500000,
      currency: 'AUD'
    },
    minMarketCap: {
      amount: 5000000,
      currency: 'AUD'
    },
    minYearsProfitability: 3,
    minShareholderCount: 400,
    minIndependentDirectors: 2,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Prospectus',
      'Financial Statements (IFRS)',
      'Risk Factors',
      'Directors Report',
      'Corporate Governance Statement'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 90,
      continuousDisclosure: 2
    },
    supportEmail: 'listings@asx.com.au',
    isLive: false,
    notes: 'Asia-Pacific gateway. Largest exchange in Southern Hemisphere'
  },

  // SAUDI ARABIA
  TADAWUL: {
    code: 'TADAWUL',
    name: 'Saudi Stock Exchange (Tadawul)',
    country: 'Saudi Arabia',
    timezone: 'Asia/Riyadh',
    regulator: 'CMA',
    regulatoryBody: 'Capital Market Authority (Saudi Arabia)',
    filingSystem: 'Tadawul Platform',
    minPublicFloat: {
      amount: 10000000,
      currency: 'SAR'
    },
    minMarketCap: {
      amount: 500000000,
      currency: 'SAR'
    },
    minYearsProfitability: 2,
    minShareholderCount: 500,
    minIndependentDirectors: 3,
    enabledModules: ['disclosure', 'ir', 'cfo', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Prospectus',
      'Financial Statements (IFRS)',
      'Risk Factors',
      'Board of Directors Information',
      'Corporate Governance Compliance',
      'Sharia Board Approval (if applicable)'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 60,
      firstAnnualReport: 90,
      continuousDisclosure: 5
    },
    supportEmail: 'support@tadawul.com.sa',
    isLive: false,
    notes: 'Middle East wealth hub. Strategic for Vision 2030 initiatives'
  },

  // HONG KONG
  HKEX: {
    code: 'HKEX',
    name: 'Hong Kong Exchanges and Clearing',
    country: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
    regulator: 'SFC',
    regulatoryBody: 'Securities and Futures Commission',
    filingSystem: 'HKExnews',
    minPublicFloat: {
      amount: 50000000,
      currency: 'HKD'
    },
    minMarketCap: {
      amount: 500000000,
      currency: 'HKD'
    },
    minYearsProfitability: 2,
    minShareholderCount: 300,
    minIndependentDirectors: 3,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'ir', 'compliance'],
    requiredDocuments: [
      'Prospectus (English & Chinese)',
      'Financial Statements (IFRS)',
      'Risk Factors',
      'Directors and Senior Management Bios',
      'Corporate Governance Code Compliance',
      'Circulars'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 120,
      continuousDisclosure: 1
    },
    supportEmail: 'issuers@hkex.com.hk',
    isLive: false,
    notes: 'Asia gateway to global markets. Dual-language filings required'
  },

  // SOUTH KOREA
  KRX: {
    code: 'KRX',
    name: 'Korea Exchange (KRX)',
    country: 'South Korea',
    timezone: 'Asia/Seoul',
    regulator: 'FSC',
    regulatoryBody: 'Financial Services Commission',
    filingSystem: 'KIND (Korea Investors Network & Exchange Database)',
    minPublicFloat: {
      amount: 5000000000,
      currency: 'KRW'
    },
    minMarketCap: {
      amount: 50000000000,
      currency: 'KRW'
    },
    minYearsProfitability: 3,
    minShareholderCount: 500,
    minIndependentDirectors: 3,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Prospectus (Korean & English)',
      'Financial Statements (K-GAAP or IFRS)',
      'Business Plan',
      'Risk Factors',
      'Corporate Governance Statement',
      'Insider Trading Policy'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 90,
      continuousDisclosure: 4
    },
    supportEmail: 'support@krx.co.kr',
    isLive: false,
    notes: 'Tech-focused exchange. Strong financial sector. Dual-language required'
  },

  // SINGAPORE
  SGX: {
    code: 'SGX',
    name: 'Singapore Exchange',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    regulator: 'MAS',
    regulatoryBody: 'Monetary Authority of Singapore',
    filingSystem: 'SGXnet',
    minPublicFloat: {
      amount: 10000000,
      currency: 'SGD'
    },
    minMarketCap: {
      amount: 50000000,
      currency: 'SGD'
    },
    minYearsProfitability: 3,
    minShareholderCount: 200,
    minIndependentDirectors: 2,
    enabledModules: ['disclosure', 'ir', 'cfo', 'executive', 'mna', 'compliance'],
    mandatoryModules: ['disclosure', 'compliance'],
    requiredDocuments: [
      'Prospectus',
      'Financial Statements (IFRS)',
      'Risk Factors',
      'Board Composition',
      'Corporate Governance Code Compliance',
      'Use of Proceeds'
    ],
    filingDeadlines: {
      firstQuarterlyReport: 45,
      firstAnnualReport: 120,
      continuousDisclosure: 2
    },
    supportEmail: 'listings@sgx.com',
    isLive: false,
    notes: 'Asian financial hub. Gateway to ASEAN markets. English-language filings'
  }
}

/**
 * Get exchange config by code
 * Throws if exchange not found
 */
export function getExchange(code: ExchangeCode): ExchangeConfig {
  const exchange = EXCHANGES[code]
  if (!exchange) {
    throw new Error(`Exchange not found: ${code}. Available: ${Object.keys(EXCHANGES).join(', ')}`)
  }
  return exchange
}

/**
 * Get all live exchanges
 */
export function getLiveExchanges(): ExchangeConfig[] {
  return Object.values(EXCHANGES).filter(e => e.isLive)
}

/**
 * Get all exchanges in a country
 */
export function getExchangesByCountry(country: string): ExchangeConfig[] {
  return Object.values(EXCHANGES).filter(e => e.country === country)
}

/**
 * Check if exchange is ready to launch
 */
export function isExchangeReady(code: ExchangeCode): boolean {
  const exchange = getExchange(code)
  return exchange.isLive
}
