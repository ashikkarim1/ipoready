import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Phase, UserRole, Exchange, ListingType, TaskStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'USD' | 'CAD', locale = 'en-CA') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date, locale = 'en-CA') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const PHASE_LABELS: Record<Phase, string> = {
  pre_planning: 'Pre-Planning',
  corporate_restructuring: 'Corporate Restructuring',
  financial_audit: 'Financial Audit',
  legal_documentation: 'Legal Documentation',
  regulatory_filing: 'Regulatory Filing',
  marketing_roadshow: 'Marketing & Roadshow',
  listing_application: 'Listing Application',
  post_listing: 'Post-Listing Compliance',
}

export const PHASE_ORDER: Phase[] = [
  'pre_planning',
  'corporate_restructuring',
  'financial_audit',
  'legal_documentation',
  'regulatory_filing',
  'marketing_roadshow',
  'listing_application',
  'post_listing',
]

export const EXCHANGE_LABELS: Record<Exchange, string> = {
  tsx: 'TSX (Toronto Stock Exchange)',
  tsxv: 'TSXV (TSX Venture Exchange)',
  cse: 'CSE (Canadian Securities Exchange)',
  nasdaq: 'NASDAQ',
  nyse: 'NYSE',
  otc: 'OTC Markets',
  cboe: 'Cboe Canada',
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  ipo: 'IPO (Initial Public Offering)',
  rto: 'RTO (Reverse Takeover)',
  direct_listing: 'Direct Listing',
  spac: 'SPAC (Special Purpose Acquisition)',
  regulation_a: 'Regulation A+ Offering',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: 'System Administrator',
  ceo: 'Chief Executive Officer (CEO)',
  cfo: 'Chief Financial Officer (CFO)',
  coo: 'Chief Operating Officer (COO)',
  legal_counsel: 'Legal Counsel',
  auditor: 'Auditor',
  go_public_advisor: 'Go-Public Advisor',
  ir_manager: 'IR Manager',
  board_member: 'Board Member',
  compliance_officer: 'Compliance Officer',
  finance_manager: 'Finance Manager',
  capital_markets: 'Capital Markets',
  read_only: 'Read Only',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  system_admin: ['admin', 'view_all', 'edit_tasks', 'upload_documents', 'approve_documents', 'manage_team', 'view_financials', 'submit_filings'],
  ceo: ['view_all', 'edit_tasks', 'upload_documents', 'approve_documents', 'manage_team', 'view_financials', 'submit_filings'],
  cfo: ['view_all', 'edit_tasks', 'upload_documents', 'approve_documents', 'view_financials', 'submit_filings'],
  coo: ['view_all', 'edit_tasks', 'upload_documents', 'approve_documents'],
  legal_counsel: ['view_all', 'edit_tasks', 'upload_documents', 'submit_filings'],
  auditor: ['view_all', 'upload_documents', 'view_financials'],
  go_public_advisor: ['view_all', 'edit_tasks', 'upload_documents', 'approve_documents', 'manage_team'],
  ir_manager: ['view_all', 'edit_tasks', 'upload_documents'],
  board_member: ['view_all'],
  compliance_officer: ['view_all', 'edit_tasks', 'submit_filings'],
  finance_manager: ['view_all', 'upload_documents', 'view_financials'],
  capital_markets: ['view_all', 'edit_tasks', 'upload_documents', 'view_financials'],
  read_only: ['view_all'],
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  review: 'Under Review',
  completed: 'Completed',
  blocked: 'Blocked',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: 'text-gray-400 bg-gray-400/10',
  in_progress: 'text-blue-400 bg-blue-400/10',
  review: 'text-yellow-400 bg-yellow-400/10',
  completed: 'text-green-400 bg-green-400/10',
  blocked: 'text-red-400 bg-red-400/10',
}

export function calculatePaceScore(completedTasks: number, totalTasks: number, daysElapsed: number, estimatedDays: number): number {
  if (totalTasks === 0) return 50
  const progressRate = completedTasks / totalTasks
  const timeRate = daysElapsed / estimatedDays
  if (timeRate === 0) return 50
  const ratio = progressRate / timeRate
  return Math.min(100, Math.max(0, Math.round(ratio * 50)))
}

export function estimateDaysToIPO(completedTasks: number, totalTasks: number, paceScore: number, baseDays: number): number {
  if (completedTasks === 0) return baseDays
  const remaining = totalTasks - completedTasks
  const avgDaysPerTask = baseDays / totalTasks
  const paceFactor = paceScore > 50 ? 0.7 : paceScore > 30 ? 1.0 : 1.5
  return Math.round(remaining * avgDaysPerTask * paceFactor)
}

export const EXCHANGE_BASE_DAYS: Record<Exchange, number> = {
  tsxv: 240,
  cse: 180,
  tsx: 365,
  otc: 120,
  nasdaq: 365,
  nyse: 400,
  cboe: 200,
}
