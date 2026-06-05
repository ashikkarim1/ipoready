import { NextRequest, NextResponse } from 'next/server'
import { generateEmailHTML, DigestMetrics } from '@/lib/email-digest-template'

interface SystemMetrics {
  uptime: number
  apiLatencyP95: number
  errorRate: number
  activeUsers: number
  documentsProcessed: number
  tasksCompleted: number
  checklistsAdvanced: number
  paceScoresUpdated: number
  documentsValidated: number
  complianceScore: number
  auditItemsResolved: number
  regulatoryChanges: number
  hoursOptimizedThisWeek: number
  costSavingsThisWeek: number
  issuesResolvedCount: number
  risksIdentifiedCount: number
  blockers: Array<{
    severity: 'critical' | 'high' | 'medium'
    title: string
    description: string
    impact: string
    daysActive: number
  }>
  warnings: Array<{
    title: string
    metric: string
    threshold: string
    current: string
  }>
}

/**
 * Fetch aggregated system metrics for the digest
 * In production, these would come from monitoring systems, databases, and analytics
 */
async function fetchSystemMetrics(): Promise<SystemMetrics> {
  // These are example calculations. In production, integrate with:
  // - Datadog/CloudWatch for uptime and latency
  // - Error tracking (Sentry)
  // - PostgreSQL for document/task metrics
  // - Custom compliance scoring system

  return {
    uptime: 99.95,
    apiLatencyP95: 87, // ms
    errorRate: 0.012, // %
    activeUsers: 234,
    documentsProcessed: 1247,
    tasksCompleted: 3892,
    checklistsAdvanced: 156,
    paceScoresUpdated: 89,
    documentsValidated: 1247,
    complianceScore: 94,
    auditItemsResolved: 12,
    regulatoryChanges: 2,
    hoursOptimizedThisWeek: 312,
    costSavingsThisWeek: 2840,
    issuesResolvedCount: 18,
    risksIdentifiedCount: 3,

    // Below the line issues
    blockers: [
      {
        severity: 'critical',
        title: 'Mobile viewport not configured for notch support',
        description: 'iPhone 12-16 with Dynamic Island will have obscured headers. Affects 45% of iOS users.',
        impact: 'App store rejection, unusable experience on modern iPhones',
        daysActive: 5
      },
      {
        severity: 'high',
        title: 'Root layout forces dynamic rendering',
        description: 'export const dynamic = "force-dynamic" disables static generation for all pages.',
        impact: '$1,000-3,000/month in unnecessary compute costs at scale',
        daysActive: 8
      },
      {
        severity: 'high',
        title: 'Document processing libraries not code-split (15-20MB)',
        description: 'docx, pdfkit, xlsx loaded globally instead of on-demand.',
        impact: '1-2s FCP penalty, 35-40% larger JS bundles',
        daysActive: 12
      }
    ],

    warnings: [
      {
        title: 'Database query N+1 pattern detected',
        metric: 'Lead capture validation',
        threshold: '< 50ms',
        current: '78ms'
      },
      {
        title: 'API caching headers missing',
        metric: 'Document endpoints',
        threshold: '85% configured',
        current: '17% configured'
      },
      {
        title: 'Touch targets below WCAG minimum',
        metric: '48px minimum',
        threshold: '0 instances',
        current: '9 instances found'
      }
    ]
  }
}

/**
 * Generate digest for a company/team
 * Sends to all team members with email digest enabled
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId, teamName = 'IPOReady', period = 'Last 7 days' } = await request.json()

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId required' },
        { status: 400 }
      )
    }

    // Fetch metrics
    const metrics = await fetchSystemMetrics()

    // Generate HTML
    const html = generateEmailHTML(
      {
        uptime: metrics.uptime,
        apiLatencyP95: metrics.apiLatencyP95,
        errorRate: metrics.errorRate,
        activeUsers: metrics.activeUsers,
        complianceScore: metrics.complianceScore,
        documentsValidated: metrics.documentsValidated,
        regulatoryChanges: metrics.regulatoryChanges,
        auditItemsResolved: metrics.auditItemsResolved,
        hoursOptimizedThisWeek: metrics.hoursOptimizedThisWeek,
        costSavingsThisWeek: metrics.costSavingsThisWeek,
        issuesResolvedCount: metrics.issuesResolvedCount,
        risksIdentifiedCount: metrics.risksIdentifiedCount,
        documentsProcessed: metrics.documentsProcessed,
        tasksCompleted: metrics.tasksCompleted,
        checklistsAdvanced: metrics.checklistsAdvanced,
        paceScoresUpdated: metrics.paceScoresUpdated,
        blockers: metrics.blockers,
        warnings: metrics.warnings
      },
      teamName,
      period
    )

    // In production, would send via SendGrid, Mailgun, or AWS SES
    // For now, return the HTML for preview
    return NextResponse.json({
      success: true,
      message: 'Digest generated',
      recipientCount: 0, // Would query database for team members with digest enabled
      nextSendDate: getNextWeekDate(),
      previewURL: '/api/email-digest/preview', // Can view generated email
      html // Can inspect HTML
    })
  } catch (error) {
    console.error('Digest generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate digest' },
      { status: 500 }
    )
  }
}

function getNextWeekDate(): string {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return nextWeek.toISOString().split('T')[0]
}
