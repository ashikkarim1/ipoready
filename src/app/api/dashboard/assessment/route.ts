import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock assessment data — in production, query database
    // This would aggregate real data from:
    // - PACE score from companies table
    // - Overdue tasks from tasks table
    // - Blocker count from task_blockers table
    // - User role from company_members table
    // - Time to IPO from companies table

    const assessment = {
      pacScore: 62,
      daysToIPO: 187,
      progressPercentage: 23,
      currentPhase: 'corporate_restructuring',
      overdueTasks: 3,
      blockerCount: 5,
      teamEngagement: 78,
      userRole: 'CEO & Co-Founder',
      criticalItems: [
        {
          title: 'PIF Forms — 3 Directors',
          daysOverdue: -7,
          impact: 'Blocking regulatory filing',
        },
        {
          title: 'Audit Committee Charter',
          daysOverdue: 0,
          impact: 'Required for governance compliance',
        },
        {
          title: 'Auditor Engagement',
          daysOverdue: -30,
          impact: 'Critical path blocker for prospectus',
        },
      ],
      focus: [
        'Complete overdue governance filings (1-2 days)',
        'Engage CPAB-registered auditor (target: 7 days)',
        'Resolve board approval bottleneck',
        'Align team on revised timeline',
      ],
      sentiment: 'at_risk', // 'on_track' | 'at_risk' | 'critical'
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Assessment API error:', error)
    return NextResponse.json(
      { error: 'Failed to load assessment' },
      { status: 500 }
    )
  }
}
