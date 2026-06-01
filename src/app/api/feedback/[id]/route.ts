import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface UpdateRequest {
  status?: string
  priority?: string
  assignedTo?: string
  internalNotes?: string
}

/**
 * GET /api/feedback/[id]
 * Get a single feedback item
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedbackId = params.id

    // Get feedback with user and category info
    const feedback = await sql`
      SELECT
        f.id,
        f.company_id,
        f.user_id,
        f.category_id,
        f.page,
        f.task,
        f.subject,
        f.feedback_text,
        f.rating,
        f.confusion_points,
        f.sentiment,
        f.status,
        f.priority,
        f.assigned_to,
        f.internal_notes,
        f.ip_address,
        f.user_agent,
        f.created_at,
        f.updated_at,
        u.email as user_email,
        u.name as user_name,
        fc.name as category_name
      FROM feedback f
      LEFT JOIN public.users u ON f.user_id = u.id
      LEFT JOIN feedback_categories fc ON f.category_id = fc.id
      WHERE f.id = ${feedbackId}
    ` as Array<any>

    if (feedback.length === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    const item = feedback[0]

    // Check access: user can view their own feedback, admins can view all
    if (
      user.role !== 'system_admin' &&
      user.role !== 'company_admin' &&
      item.user_id !== user.id
    ) {
      return NextResponse.json({ error: 'Not authorized to view this feedback' }, { status: 403 })
    }

    return NextResponse.json({ data: item }, { status: 200 })
  } catch (error) {
    console.error('[feedback-get] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/feedback/[id]
 * Update feedback status/priority (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedbackId = params.id
    const body = await request.json() as UpdateRequest

    // Get the feedback to check permissions and ensure it exists
    const feedback = await sql`
      SELECT company_id FROM feedback WHERE id = ${feedbackId}
    ` as Array<{ company_id: string }>

    if (feedback.length === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    // Check authorization: company admin can only update feedback from their company
    if (user.role === 'company_admin' && feedback[0].company_id !== user.companyId) {
      return NextResponse.json(
        { error: 'You can only update feedback from your company' },
        { status: 403 }
      )
    }

    // Only admins can update
    if (user.role !== 'company_admin' && user.role !== 'system_admin') {
      return NextResponse.json({ error: 'Only admins can update feedback' }, { status: 403 })
    }

    const updates: any = {}

    // Validate and apply updates
    if (body.status && ['new', 'acknowledged', 'in_progress', 'resolved', 'wontfix'].includes(body.status)) {
      updates.status = body.status
    }
    if (body.priority && ['low', 'medium', 'high', 'critical'].includes(body.priority)) {
      updates.priority = body.priority
    }
    if (body.assignedTo !== undefined) {
      updates.assigned_to = body.assignedTo || null
    }
    if (body.internalNotes !== undefined) {
      updates.internal_notes = body.internalNotes || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Execute update with explicit fields
    const result = await sql`
      UPDATE feedback
      SET 
        status = COALESCE(${updates.status || null}, status),
        priority = COALESCE(${updates.priority || null}, priority),
        assigned_to = COALESCE(${updates.assigned_to || null}, assigned_to),
        internal_notes = COALESCE(${updates.internal_notes || null}, internal_notes),
        updated_at = NOW()
      WHERE id = ${feedbackId}
      RETURNING *
    ` as Array<any>

    if (result.length === 0) {
      return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, data: result[0], message: 'Feedback updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[feedback-patch] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/feedback/[id]
 * Delete feedback (admin only, with audit trail)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

    // Only system admins can delete
    if (!session || !user?.id || user.role !== 'system_admin') {
      return NextResponse.json(
        { error: 'Only system admins can delete feedback' },
        { status: 403 }
      )
    }

    const feedbackId = params.id

    // Verify feedback exists
    const feedback = await sql`
      SELECT id FROM feedback WHERE id = ${feedbackId}
    ` as Array<{ id: string }>

    if (feedback.length === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    // Delete the feedback
    await sql`
      DELETE FROM feedback WHERE id = ${feedbackId}
    `

    return NextResponse.json(
      { success: true, message: 'Feedback deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[feedback-delete] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
