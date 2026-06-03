import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface RouteContext {
  params: {
    id: string
  }
}

// ============================================================================
// GET /api/compliance/resolutions/[id] - Get resolution details
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params

    // Fetch resolution
    const resolutionResult = await sql`
      SELECT * FROM board_resolutions WHERE id = $1
    `(id)

    if (resolutionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resolution not found' },
        { status: 404 }
      )
    }

    const resolution = resolutionResult.rows[0]

    // Fetch approvals
    const approvalsResult = await sql`
      SELECT * FROM resolution_approvals WHERE resolution_id = $1
      ORDER BY created_at ASC
    `(id)

    return NextResponse.json({
      success: true,
      resolution: {
        ...resolution,
        approvals: approvalsResult.rows,
      },
    })
  } catch (error) {
    console.error('Error fetching resolution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resolution' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/compliance/resolutions/[id] - Update resolution
// ============================================================================

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { status, effectiveDate, htmlContent } = body

    // Validate status
    const validStatuses = ['draft', 'approved', 'executed', 'archived', 'rejected']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramCounter = 1

    if (status) {
      updateFields.push(`status = $${paramCounter++}`)
      updateValues.push(status)
    }

    if (effectiveDate) {
      updateFields.push(`execution_date = $${paramCounter++}`)
      updateValues.push(new Date(effectiveDate))
    }

    if (htmlContent) {
      updateFields.push(`html_content = $${paramCounter++}`)
      updateValues.push(htmlContent)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(id)

    const query = `
      UPDATE board_resolutions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING id, status, updated_at
    `

    const result = await sql(query, updateValues as any[])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resolution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      resolution: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating resolution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update resolution' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/compliance/resolutions/[id] - Archive resolution
// ============================================================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params

    const result = await sql`
      UPDATE board_resolutions
      SET status = 'archived', archived_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `(id)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resolution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Resolution archived successfully',
    })
  } catch (error) {
    console.error('Error archiving resolution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to archive resolution' },
      { status: 500 }
    )
  }
}
