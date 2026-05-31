export type UserRole =
  | 'system_admin'
  | 'ceo'
  | 'cfo'
  | 'coo'
  | 'legal_counsel'
  | 'auditor'
  | 'go_public_advisor'
  | 'ir_manager'
  | 'board_member'
  | 'compliance_officer'
  | 'finance_manager'
  | 'capital_markets'
  | 'read_only'

export type ListingType = 'ipo' | 'rto' | 'direct_listing' | 'spac' | 'regulation_a'
export type Exchange = 'tsx' | 'tsxv' | 'cse' | 'nasdaq' | 'nyse' | 'otc' | 'cboe'
export type TaskStatus = 'not_started' | 'in_progress' | 'review' | 'completed' | 'blocked'
export type Phase =
  | 'pre_planning'
  | 'corporate_restructuring'
  | 'financial_audit'
  | 'legal_documentation'
  | 'regulatory_filing'
  | 'marketing_roadshow'
  | 'listing_application'
  | 'post_listing'

export type Currency = 'USD' | 'CAD'
export type Language = 'en' | 'fr'
export type NotificationFrequency = 'daily' | 'weekly' | 'milestone_only' | 'none'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  avatarUrl?: string
  language: Language
  currency: Currency
  notificationFrequency: NotificationFrequency
  isApproved: boolean
  createdAt: string
}

export interface Company {
  id: string
  name: string
  listingType: ListingType
  targetExchange: Exchange
  currentPhase: Phase
  paceScore: number
  estimatedDaysToIPO: number
  progressPercentage: number
  currency: Currency
  language: Language
  createdAt: string
  ownerId: string
}

export interface Task {
  id: string
  companyId: string
  phase: Phase
  category: string
  title: string
  description: string
  status: TaskStatus
  assignedTo?: string
  dueDate?: string
  completedAt?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedDays: number
  learnMoreUrl?: string
  secCitation?: string
  commonPitfalls: string[]
  examples: string[]
  documents: string[]
  order: number
}

export interface Document {
  id: string
  companyId: string
  taskId?: string
  name: string
  type: DocumentType
  url?: string
  driveUrl?: string
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadedAt?: string
  verifiedAt?: string
  uploadedBy?: string
}

export type DocumentType =
  | 'prospectus'
  | 'pif'
  | 'financial_statements'
  | 'articles_of_incorporation'
  | 'board_resolutions'
  | 'material_contracts'
  | 'audit_report'
  | 'legal_opinion'
  | 'escrow_agreement'
  | 'underwriting_agreement'
  | 'lock_up_agreement'
  | 'management_discussion'
  | 'governance_policy'
  | 'other'

export interface TeamMember {
  id: string
  companyId: string
  userId: string
  role: UserRole
  notificationFrequency: NotificationFrequency
  permissions: Permission[]
  invitedAt: string
  acceptedAt?: string
}

export type Permission =
  | 'view_all'
  | 'edit_tasks'
  | 'upload_documents'
  | 'approve_documents'
  | 'manage_team'
  | 'view_financials'
  | 'submit_filings'
  | 'admin'

export interface Milestone {
  id: string
  companyId: string
  phase: Phase
  title: string
  description: string
  completedAt?: string
  animationType: 'rocket' | 'star' | 'trophy' | 'flag' | 'planet' | 'satellite'
  xpEarned: number
}

export interface Notification {
  id: string
  companyId: string
  userId: string
  type: 'task_due' | 'task_completed' | 'document_uploaded' | 'milestone' | 'team_update' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface PaceMetric {
  currentPace: number
  trend: 'accelerating' | 'steady' | 'slowing'
  completedTasksLast7Days: number
  estimatedDaysToCompletion: number
  phaseProgress: { phase: Phase; percentage: number }[]
}

export interface Template {
  id: string
  name: string
  type: DocumentType
  exchange: Exchange[]
  listingType: ListingType[]
  description: string
  isFree: boolean
  priceUSD: number
  priceCAD: number
  downloadUrl?: string
  lastUpdated: string
}

export interface ServiceProvider {
  id: string
  category: 'lawyer' | 'auditor' | 'advisor' | 'ir_firm' | 'director' | 'transfer_agent'
  isVisible: boolean
  specialties: Exchange[]
  priceRangeMin: number
  priceRangeMax: number
  currency: Currency
  inquiryCount: number
}

export interface PricingPlan {
  id: string
  nameEn: string
  nameFr: string
  descriptionEn: string
  descriptionFr: string
  priceMonthlyUSD: number
  priceMonthlyCAD: number
  priceAnnualUSD: number
  priceAnnualCAD: number
  features: string[]
  isPopular: boolean
  maxTeamMembers: number
  exchanges: Exchange[]
}
