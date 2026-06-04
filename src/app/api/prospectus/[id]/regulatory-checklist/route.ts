import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/prospectus/[id]/regulatory-checklist
 * Fetch regulatory checklist items for a prospectus
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectusId = params.id
    const exchange = request.nextUrl.searchParams.get('exchange') || 'tsxv'

    // TODO: Implement database query to fetch regulatory checklist items
    // const items = await db.regulatoryChecklistItem.findMany({
    //   where: { prospectusId, exchange }
    // })

    // For now, return mock data
    const mockItems = [
      {
        id: '1',
        exchange,
        category: 'board-composition',
        requirement: 'Minimum 2 independent directors',
        description: 'Board must have at least 2 independent directors',
        isMet: true,
        critical: true,
      },
      {
        id: '2',
        exchange,
        category: 'board-composition',
        requirement: 'Minimum 3 directors total',
        description: 'Board must have at least 3 total directors',
        isMet: true,
        critical: true,
      },
      {
        id: '3',
        exchange,
        category: 'committees',
        requirement: 'Audit committee established',
        description: 'Must have an active audit committee',
        isMet: true,
        critical: true,
      },
      {
        id: '4',
        exchange,
        category: 'expertise',
        requirement: 'Audit committee financial expert',
        description: 'At least one audit committee member must be a financial expert',
        isMet: true,
        critical: true,
      },
      {
        id: '5',
        exchange,
        category: 'committees',
        requirement: 'Compensation committee recommended',
        description: 'Compensation committee is recommended (not mandatory)',
        isMet: true,
        critical: false,
      },
      {
        id: '6',
        exchange,
        category: 'documentation',
        requirement: 'All directors/officers PIFs submitted',
        description: 'Personal Information Forms required for all directors and officers',
        isMet: true,
        critical: true,
      },
    ]

    return NextResponse.json({
      success: true,
      items: mockItems,
    })
  } catch (error) {
    console.error('Error fetching regulatory checklist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch regulatory checklist' },
      { status: 500 }
    )
  }
}
