import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface RouteContext {
  params: {
    id: string
  }
}

// ============================================================================
// POST /api/compliance/resolutions/[id]/approve - Record board member approval
// ============================================================================

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { boardMemberName, approvalDate, signatureData } = body

    if (!boardMemberName) {
      return NextResponse.json(
        { success: false, error: 'Board member name is required' },
        { status: 400 }
      )
    }

    // Verify resolution exists
    const resolutionResult = await sql`
      SELECT * FROM board_resolutions WHERE id = $1
    `(id)

    if (resolutionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Resolution not found' },
        { status: 404 }
      )
    }

    // Update approval record
    const approvalResult = await sql`
      UPDATE resolution_approvals
      SET 
        approval_status = 'approved',
        approval_date = $1,
        signature_data = $2,
        updated_at = NOW()
      WHERE resolution_id = $3 AND board_member_name = $4
      RETURNING id, approval_status, approval_date
    `(
      approvalDate || new Date(),
      signatureData || null,
      id,
      boardMemberName
    )

    if (approvalResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Board member approval record not found' },
        { status: 404 }
      )
    }

    // Count total approvals
    const countResult = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved
      FROM resolution_approvals
      WHERE resolution_id = $1
    `(id)

    const { total, approved } = countResult.rows[0]

    // Update resolution approval count
    await sql`
      UPDATE board_resolutions
      SET approval_count = $1, updated_at = NOW()
      WHERE id = $2
    `(approved, id)

    // Check if all members have approved
    const allApproved = total === approved
    if (allApproved && total > 0) {
      await sql`
        UPDATE board_resolutions
        SET status = 'approved'
        WHERE id = $1
      `(id)
    }

    return NextResponse.json({
      success: true,
      approval: approvalResult.rows[0],
      resolutionStatus: allApproved ? 'approved' : 'approved',
      approvalProgress: {
        approved,
        total,
        percentage: Math.round((approved / total) * 100),
      },
    })
  } catch (error) {
    console.error('Error recording approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record approval' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET /api/compliance/resolutions/[id]/approve - Get approval status
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params

    const approvalsResult = await sql`
      SELECT 
        ra.*,
        COUNT(*) OVER () as total_approvals
      FROM resolution_approvals ra
      WHERE resolution_id = $1
      ORDER BY created_at ASC
    `(id)

    if (approvalsResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        approvals: [],
        summary: {
          total: 0,
          approved: 0,
          pending: 0,
          percentage: 0,
        },
      })
    }

    const approvals = approvalsResult.rows
    const total = approvals[0]?.total_approvals || approvals.length
    const approved = approvals.filter((a: any) => a.approval_status === 'approved').length
    const pending = total - approved

    return NextResponse.json({
      success: true,
      approvals,
      summary: {
        total,
        approved,
        pending,
        percentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}
