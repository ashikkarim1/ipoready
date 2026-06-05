import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/intelligence/briefing?date=YYYY-MM-DD&companyId=<id>
 *
 * Returns the morning briefing for a specific date and company
 * Includes critical alerts, KPI snapshot, and recommended actions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    // Mock briefing data (database connection to be configured separately)
    const mockBriefing = {
      date,
      companyId,
      criticalAlerts: [
        {
          id: '1',
          title: 'Market opportunity detected',
          description: 'Strong institutional investor demand in IPO window',
          severity: 'medium',
          action: 'Accelerate pre-marketing timeline',
        },
      ],
      kpiSnapshot: {
        pace: 73,
        revenue: 1.04,
        arr: 12.4,
        margins: 76,
        runway: 8.4,
        churn: 2.1,
        capTable: 95,
        governance: 78,
      },
      marketIntelligence: [
        {
          headline: 'Tech IPO Market Shows Strong Recovery',
          source: 'Bloomberg',
          summary: 'Institutional investors returning to IPO market with renewed confidence',
          relevance: 'HIGH',
          probability: 0.85,
          suggestedAction: 'Consider accelerating IPO timeline',
          urgency: 'this-week',
        },
      ],
      recommendedActions: [
        {
          id: '1',
          title: 'Update financial projections',
          description: 'Market conditions have improved, update 3-year projections',
          priority: 'HIGH',
          estimatedTime: '4 hours',
        },
      ],
      generatedAt: new Date().toISOString(),
      status: 'success',
    }

    return NextResponse.json(mockBriefing, { status: 200 })
  } catch (error) {
    console.error('Briefing API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/intelligence/briefing/subscribe
 * Subscribe to morning briefing with preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = {
      status: 'subscribed',
      message: 'Successfully subscribed to morning briefing',
      preferences: body,
      subscriptionId: `sub_${Date.now()}`,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe to briefing' },
      { status: 500 }
    )
  }
}
