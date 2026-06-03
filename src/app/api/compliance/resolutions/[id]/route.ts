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
      SELECT * FROM board_resolutions WHERE id = ${id}
    `

    if (resolutionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resolution not found' },
        { status: 404 }
      )
    }

    const resolution = resolutionResult[0]

    // Fetch approvals
    const approvalsResult = await sql`
      SELECT * FROM resolution_approvals WHERE resolution_id = ${id}
      ORDER BY created_at ASC
    `

    return NextResponse.json({
      success: true,
      resolution: {
        ...resolution,
        approvals: approvalsResult,
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

    // Update resolution based on provided fields
    if (!status && !effectiveDate && !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    let result
    if (status && effectiveDate && htmlContent) {
      result = await sql`
        UPDATE board_resolutions
        SET status = ${status}, execution_date = ${new Date(effectiveDate)}, html_content = ${htmlContent}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    } else if (status && effectiveDate) {
      result = await sql`
        UPDATE board_resolutions
        SET status = ${status}, execution_date = ${new Date(effectiveDate)}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    } else if (status && htmlContent) {
      result = await sql`
        UPDATE board_resolutions
        SET status = ${status}, html_content = ${htmlContent}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    } else if (effectiveDate && htmlContent) {
      result = await sql`
        UPDATE board_resolutions
        SET execution_date = ${new Date(effectiveDate)}, html_content = ${htmlContent}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    } else if (status) {
      result = await sql`
        UPDATE board_resolutions
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    } else if (effectiveDate) {
      result = await sql`
        UPDATE board_resolutions
        SET execution_date = ${new Date(effectiveDate)}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    } else if (htmlContent) {
      result = await sql`
        UPDATE board_resolutions
        SET html_content = ${htmlContent}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status, updated_at
      `
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resolution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      resolution: result[0],
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
      WHERE id = ${id}
      RETURNING id, status
    `

    if (result.length === 0) {
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
