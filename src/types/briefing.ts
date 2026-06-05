/**
 * Morning Briefing System Types
 * Real-time market intelligence for IPO teams
 */

export type NewsSourceCategory = 'regulatory' | 'ipo' | 'competitor' | 'market'
export type ImpactType = 'timeline_delay' | 'valuation_pressure' | 'opportunity' | 'regulatory' | 'competitive'
export type Urgency = 'immediate' | 'this-week' | 'this-month'
export type Sentiment = 'positive' | 'negative' | 'neutral'

/**
 * News Source Configuration
 */
export interface NewsSource {
  id: string
  name: string
  url: string
  category: NewsSourceCategory
  apiEndpoint?: string
  apiKeyVaultPath?: string
  scrapeFrequencyMinutes: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Raw News Article (from scraper)
 */
export interface NewsArticle {
  id: string
  sourceId: string
  headline: string
  url: string
  content?: string
  publishedAt?: Date
  fetchedAt: Date
  aiSummary?: string
  relevanceScore: number // 0-1
  sentiment: Sentiment
  createdAt: Date
}

/**
 * Impact Assessment (AI-generated per company)
 */
export interface NewsImpact {
  id: string
  articleId: string
  companyId: string
  impactType: ImpactType
  impactDescription?: string
  probability: number // 0-1 confidence
  expectedTimelineImpactDays?: number
  recommendedAction?: string
  urgency: Urgency
  relatedKpis: string[] // KPI field names affected
  createdAt: Date
}

/**
 * User News Preferences
 */
export interface NewsPreferences {
  id: string
  userId: string
  companyId: string
  categories: NewsSourceCategory[]
  emailEnabled: boolean
  emailTime: string // HH:MM format
  emailFrequency: 'daily' | 'weekly' | 'immediate'
  inAppEnabled: boolean
  competitorsToTrack: string[]
  excludeCategories: NewsSourceCategory[]
  minUrgencyThreshold: Urgency
  createdAt: Date
  updatedAt: Date
}

/**
 * Morning Briefing Delivery Record
 */
export interface BriefingSend {
  id: string
  companyId: string
  recipientEmail: string
  recipientUserId?: string
  articlesCount: number
  criticalAlertsCount: number
  sentAt: Date
  openedAt?: Date
  clickedAt?: Date
  actionsCreatedFromBriefing: number
  emailSubject?: string
  emailPreview?: string
  status: 'draft' | 'sent' | 'bounced' | 'unsubscribed'
}

/**
 * Briefing Content for Delivery
 */
export interface BriefingContent {
  id?: string
  companyId: string
  timestamp: Date
  criticalAlerts: BriefingAlert[]
  kpiSnapshot: KpiSnapshot
  competitorIntelligence: CompetitorUpdate[]
  recommendedActions: RecommendedAction[]
  unreadArticleCount: number
}

/**
 * Single alert in the morning briefing
 */
export interface BriefingAlert {
  articleId: string
  headline: string
  source: string
  publishedAt: Date
  impact: NewsImpact
  aiSummary: string
  urgency: Urgency
  recommendedAction: string
  relatedDocuments: string[] // Document URLs or references
}

/**
 * KPI Snapshot at briefing time
 */
export interface KpiSnapshot {
  paceScore: number
  paceTarget: number
  monthlyRevenue: number
  arr: number
  grossMarginPct: number
  cashRunwayMonths: number
  churnPct: number
  capTableClarity: number
  governanceScore: number
  prediction?: {
    paceScoreTrendDays: number
    runwayDepletionDate: string
    nextMilestoneDate: string
  }
}

/**
 * Competitor Intelligence Update
 */
export interface CompetitorUpdate {
  competitorName: string
  recentNews: {
    headline: string
    type: 'funding' | 'executive' | 'product' | 'customer' | 'other'
    date: Date
    source: string
  }
  comparison?: {
    growthRate: number // vs our growth
    margin: number // vs our margin
    valuation?: number
    implication: string
    recommendation: string
  }
}

/**
 * Recommended Action from Intelligence
 */
export interface RecommendedAction {
  id?: string
  type: 'immediate' | 'this-week' | 'this-month'
  title: string
  description: string
  impactArea: string[]
  timeEstimate: string
  relatedArticles: string[]
  relatedMetrics: string[]
  suggestedDocuments: string[]
}

/**
 * Briefing Template
 */
export interface BriefingTemplate {
  id: string
  name: string
  version: number
  htmlTemplate: string
  textTemplate?: string
  subjectLine: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Action Item Created from Briefing
 */
export interface BriefingActionItem {
  id: string
  userId: string
  companyId: string
  articleId?: string
  briefingSendId?: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'completed'
  createdAt: Date
  completedAt?: Date
}

/**
 * Scraper Job Status
 */
export interface ScraperJobStatus {
  sourceId: string
  sourceName: string
  lastRunAt?: Date
  nextRunAt: Date
  articlesFound: number
  articlesProcessed: number
  articlesRelevant: number
  errors?: string[]
  status: 'pending' | 'running' | 'success' | 'failed'
}

/**
 * News Relevance Engine Input
 */
export interface RelevanceCheckInput {
  headline: string
  content: string
  companyInfo: {
    name: string
    industry: string
    competitors: string[]
    stage: string
  }
}

/**
 * AI Impact Assessment Request
 */
export interface ImpactAssessmentRequest {
  article: NewsArticle
  companyInfo: {
    id: string
    name: string
    stage: string
    metrics: KpiSnapshot
  }
}

/**
 * Briefing Delivery Request
 */
export interface BriefingDeliveryRequest {
  companyId: string
  userId: string
  emailAddress: string
  timezone: string
  preferences: NewsPreferences
}

/**
 * Email Delivery Response
 */
export interface EmailDeliveryResponse {
  success: boolean
  briefingSendId: string
  messageId?: string
  error?: string
  sentAt: Date
}
