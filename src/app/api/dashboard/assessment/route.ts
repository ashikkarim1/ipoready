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

      // Validation gaps from compliance framework
      readinessGaps: [
        {
          category: 'Governance',
          severity: 'critical',
          title: 'PIF Forms Missing',
          description: '3 directors have not submitted Personal Information Forms',
          impact: 'Cannot file listing application without PIFs',
          costToFix: '$0 (internal)',
          timeToFix: '3-5 days',
          recommendation: 'Escalate to CEO: collect residential histories from all 3 directors today',
        },
        {
          category: 'Governance',
          severity: 'critical',
          title: 'Audit Committee Charter Not Adopted',
          description: 'Required under NI 52-110 for public companies',
          impact: 'Listing application will be rejected without this',
          costToFix: '$2K-5K (counsel review)',
          timeToFix: '7-10 days',
          recommendation: 'Board resolution needed — schedule board meeting this week',
        },
        {
          category: 'Financial',
          severity: 'high',
          title: 'CPAB-Registered Auditor Not Engaged',
          description: 'Required to conduct statutory audit for IPO',
          impact: 'Cannot file prospectus — critical path blocker',
          costToFix: '$75K-120K (audit fees)',
          timeToFix: '7-14 days (RFP to engagement)',
          recommendation: 'Issue RFP to MNP, BDO, Grant Thornton — target engagement this week',
        },
      ],

      timelineRisks: [
        {
          category: 'Critical Path',
          severity: 'high',
          title: 'Sequential vs. Parallel Work',
          description: 'Many tasks are running sequentially that could run in parallel',
          impact: 'Could add 45+ days to timeline unnecessarily',
          costToFix: '$0 (planning only)',
          timeToFix: '1 day to replan',
          recommendation: 'Run legal docs + financial audit in parallel — saves 30 days',
        },
      ],

      advisorConcerns: [
        {
          category: 'Advisor Fit',
          severity: 'medium',
          title: 'Auditor Experience Gap',
          description: 'Current auditor lacks recent TSXV IPO experience',
          impact: 'May slow audit process or miss compliance nuances',
          costToFix: '$20K-50K (switching costs)',
          timeToFix: 'Immediate (if switching)',
          recommendation: 'Consider MNP LLP or BDO — both have 15+ TSXV IPOs in past 3 years',
        },
      ],

      documentGaps: [
        {
          category: 'Documents',
          severity: 'high',
          title: 'Board Resolution Documentation',
          description: 'Board resolutions for IPO decisions not yet documented',
          impact: 'Disclosure requirement — missing docs trigger SEC comments',
          costToFix: '$1K-3K (counsel)',
          timeToFix: '2-3 days',
          recommendation: 'Counsel to prepare resolutions for next board meeting — get signed',
        },
      ],

      regulatoryRedFlags: [
        {
          category: 'Regulatory',
          severity: 'medium',
          title: 'Revenue Concentration Risk',
          description: '45% of revenue from top 3 customers',
          impact: 'Will be flagged by SEC — need strong mitigation narrative',
          costToFix: '$0 (narrative only)',
          timeToFix: '3-5 days',
          recommendation: 'Prepare customer concentration section for prospectus — explain strategy to reduce',
        },
      ],

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
