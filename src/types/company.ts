/**
 * Company lifecycle stages
 * This determines which menu items and features are visible
 */

export type CompanyStatus = 'pre-ipo' | 'ipo-in-progress' | 'public' | 'exited' | 'other'

export type Exchange = 'TSX' | 'TSXV' | 'CSE' | 'NASDAQ' | 'NYSE' | 'OTCQX' | 'OTCQB' | string

export interface CompanyProfile {
  id: string
  name: string
  status: CompanyStatus
  exchange?: Exchange
  ipo_completion_date?: Date
  listing_date?: Date
  founded_date?: Date
  hq_jurisdiction?: string
  sector?: string
  industry?: string
  description?: string
  website?: string
  logo_url?: string
  employee_count?: number
  revenue_run_rate?: number

  // Metadata
  created_at: Date
  updated_at: Date
}

/**
 * Determines which menu sections to show based on company status
 */
export function getCompanyMenuState(status: CompanyStatus) {
  const states: Record<CompanyStatus, { show: string[]; hide: string[]; showLocked?: string[] }> = {
    'pre-ipo': {
      show: ['MISSION', 'WORK', 'PEOPLE', 'INVESTOR_READINESS', 'MARKET_ANALYSIS', 'FINANCIAL', 'COMPLIANCE', 'FILINGS', 'RESOURCES', 'SETTINGS'],
      hide: ['LISTED_SERVICES'],
      showLocked: ['LISTED_SERVICES_LOCKED']
    },
    'ipo-in-progress': {
      show: ['MISSION', 'WORK', 'PEOPLE', 'INVESTOR_READINESS', 'MARKET_ANALYSIS', 'FINANCIAL', 'COMPLIANCE', 'FILINGS', 'RESOURCES', 'SETTINGS'],
      hide: ['LISTED_SERVICES'],
      showLocked: ['LISTED_SERVICES_LOCKED']
    },
    'public': {
      show: ['DASHBOARD', 'LISTED_SERVICES', 'IPO_HISTORY_ARCHIVE', 'SETTINGS'],
      hide: ['WORK', 'COMPLIANCE', 'FILINGS']
    },
    'exited': {
      show: ['DASHBOARD', 'IPO_HISTORY_ARCHIVE', 'SETTINGS'],
      hide: ['LISTED_SERVICES', 'WORK', 'COMPLIANCE']
    },
    'other': {
      show: ['DASHBOARD', 'RESOURCES', 'SETTINGS'],
      hide: ['LISTED_SERVICES', 'WORK']
    }
  }
  return states[status]
}
