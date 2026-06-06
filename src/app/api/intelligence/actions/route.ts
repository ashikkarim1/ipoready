import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
/**
 * GET /api/intelligence/actions?companyId=<id>
 * Retrieve all action items for a company
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    // Mock action items (database to be configured separately)
    const mockActions = {
      companyId,
      actions: [
        {
          id: '1',
          title: 'Update financial projections',
          source: 'Market Intelligence',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          status: 'pending',
          assignee: 'CFO',
          estimatedTime: '4 hours',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Board meeting - IPO timeline review',
          source: 'Autonomous Actions',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 604800000).toISOString(),
          status: 'pending',
          assignee: 'CEO',
          estimatedTime: '2 hours',
          createdAt: new Date().toISOString(),
        },
      ],
      totalCount: 2,
    }

    return NextResponse.json(mockActions, { status: 200 })
  } catch (error) {
    console.error('Actions API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve actions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/intelligence/actions
 *
 * Create an action item from a news article in the briefing
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      companyId,
      articleId,
      briefingSendId,
      title,
      description,
      dueDate,
      priority,
    } = await request.json()

    if (!companyId || !title) {
      return NextResponse.json(
        { error: 'companyId and title are required' },
        { status: 400 }
      )
    }

    const newAction = {
      id: `action_${Date.now()}`,
      userId,
      companyId,
      articleId,
      briefingSendId,
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newAction, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/intelligence/actions?actionId=<id>
 * Update an action item
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actionId = searchParams.get('actionId')
    const body = await request.json()

    const updatedAction = {
      id: actionId,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedAction, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/intelligence/actions?actionId=<id>
 * Delete an action item
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actionId = searchParams.get('actionId')

    return NextResponse.json(
      { message: 'Action deleted', actionId },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    )
  }
}
