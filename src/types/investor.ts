/**
 * Investor Platform Types
 * All TypeScript interfaces for investor-facing features
 */

export interface InvestorProfile {
  id: string
  email: string
  name: string
  firmName: string
  role: string
  minCheckSize: number
  maxCheckSize: number
  profileComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InvestorCriteria {
  id: string
  investorId: string
  preferredStages: string[]  // ['Seed', 'Series A', 'Series B', ...]
  preferredSectors: string[]  // ['Enterprise SaaS', 'FinTech', ...]
  preferredGeographies: string[]  // ['North America', 'Europe', ...]
  fundingTypes: ('equity' | 'debt' | 'bridge')[]
  createdAt: Date
  updatedAt: Date
}

export interface InvestorNotificationPreferences {
  id: string
  investorId: string
  emailNotificationsEnabled: boolean
  realTimeAlertsEnabled: boolean
  weeklyDigestEnabled: boolean
  weeklyDigestDay: string
  alertOnPaceDrop: boolean
  alertOnCustomerConcentration: boolean
  alertOnRunwayLow: boolean
  alertOnKeyPersonDeparture: boolean
  alertOnRegulatoryIssue: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InvestorSavedCompany {
  id: string
  investorId: string
  companyId: string
  companyName: string
  savedAt: Date
  notes?: string
  priority: 'HOT' | 'NORMAL' | 'MAYBE'
}

export interface InvestorAlert {
  id: string
  investorId: string
  companyId: string
  companyName: string
  alertType: 'company_raise' | 'pace_drop' | 'customer_departure' | 'regulatory_issue' | 'milestone'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  matchScore?: number
  fundingAmount?: number
  fundingType?: 'equity' | 'debt' | 'bridge'
  emailSent: boolean
  emailSentAt?: Date
  emailOpened: boolean
  emailOpenedAt?: Date
  emailClicked: boolean
  emailClickedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface InvestorMessage {
  id: string
  investorId: string
  companyId: string
  subject: string
  body: string
  messageType: 'outreach' | 'follow_up' | 'question'
  status: 'DRAFT' | 'SENT' | 'OPENED' | 'REPLIED' | 'MEETING_SCHEDULED'
  sentAt?: Date
  openedAt?: Date
  repliedAt?: Date
  nextFollowUp?: Date
  followUpCount: number
  createdAt: Date
  updatedAt: Date
}

export interface InvestorEmailLog {
  id: string
  investorId: string
  emailType: 'company_alert' | 'weekly_digest' | 'outreach_template'
  recipientEmail: string
  subject: string
  resendMessageId?: string
  resendStatus?: string
  sentAt: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  bouncedAt?: Date
  companyId?: string
  companyName?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvestorPortfolio {
  id: string
  investorId: string
  companyId: string
  investmentDate: Date
  investmentAmount?: number
  roundType?: string
  ownershipPercentage?: number
  status: 'ACTIVE' | 'EXITED' | 'WRITE_OFF'
  exitDate?: Date
  exitValue?: number
  createdAt: Date
  updatedAt: Date
}

export interface InvestorActivityLog {
  id: string
  investorId: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// ─────────────────────────────────────────────────────────────────────────
// Request/Response Types
// ─────────────────────────────────────────────────────────────────────────

export interface CreateInvestorRequest {
  email: string
  name: string
  firmName: string
  role: string
  minCheckSize: number
  maxCheckSize: number
}

export interface UpdateInvestorCriteriaRequest {
  preferredStages: string[]
  preferredSectors: string[]
  preferredGeographies: string[]
  fundingTypes: ('equity' | 'debt' | 'bridge')[]
}

export interface InvestorSignupRequest {
  email: string
  name: string
  firmName: string
  role: string
  minCheckSize: number
  maxCheckSize: number
  preferredStages: string[]
  preferredSectors: string[]
  preferredGeographies: string[]
}

export interface SendInvestorAlertRequest {
  investorId: string
  companyId: string
  companyName: string
  alertType: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  matchScore?: number
  fundingAmount?: number
  fundingType?: string
}

export interface SendWeeklyDigestRequest {
  investorId: string
  companies: Array<{
    id: string
    name: string
    sector: string
    matchScore: number
    fundingAmount: number
    fundingType: string
  }>
  stats: {
    newMatches: number
    totalActive: number
    totalAvailable: number
  }
}
