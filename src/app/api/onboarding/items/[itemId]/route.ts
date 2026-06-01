import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface UpdateItemRequest {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  completionPercentage?: number
  skipReason?: string
}

interface ItemRow {
  company_id: string
  checklist_id: string
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{  itemId: string  }> }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId
  const params = await context.params
  const itemId = params.itemId

  try {
    const body = (await request.json()) as UpdateItemRequest
    const { status, completionPercentage = 100, skipReason } = body

    // Verify item belongs to user's company
    const item = await sql`
      SELECT company_id, checklist_id FROM checklist_items WHERE id = ${itemId}
    ` as ItemRow[]

    if (item.length === 0 || item[0].company_id !== companyId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const checklistId = item[0].checklist_id

    // Update item
    const completedAt =
      status === 'completed' ? 'NOW()' : status === 'skipped' ? 'NOW()' : null

    await sql`
      UPDATE checklist_items
      SET status = ${status},
          completion_percentage = ${completionPercentage},
          skip_reason = ${skipReason || null},
          completed_at = ${completedAt === 'NOW()' ? new Date() : null},
          updated_at = NOW()
      WHERE id = ${itemId}
    `

    // Recalculate checklist completion percentage
    const itemStats = await sql`
      SELECT
        COUNT(id) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM checklist_items
      WHERE checklist_id = ${checklistId}
    ` as Array<{ total: number; completed: number }>

    const newCompletion =
      itemStats[0].total > 0
        ? Math.round((itemStats[0].completed / itemStats[0].total) * 100)
        : 0

    await sql`
      UPDATE onboarding_checklists
      SET completion_percentage = ${newCompletion},
          updated_at = NOW()
      WHERE id = ${checklistId}
    `

    // Check if all required items are completed
    const requiredIncomplete = await sql`
      SELECT COUNT(id) as count FROM checklist_items
      WHERE checklist_id = ${checklistId}
      AND required = true
      AND status != 'completed'
    ` as Array<{ count: number }>

    let checklistStatus = 'in_progress'
    if (requiredIncomplete[0].count === 0) {
      checklistStatus = 'completed'
      await sql`
        UPDATE onboarding_checklists
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${checklistId}
      `

      await sql`
        UPDATE companies
        SET onboarding_status = 'completed',
            onboarding_completed_at = NOW()
        WHERE id = ${companyId}
      `
    }

    // Log event
    await sql`
      INSERT INTO onboarding_progress_logs (
        company_id,
        checklist_id,
        event_type,
        event_data,
        created_at
      ) VALUES (
        ${companyId},
        ${checklistId},
        'item_completed',
        ${JSON.stringify({ itemId, status, completionPercentage })},
        NOW()
      )
    `

    return NextResponse.json({
      success: true,
      itemId,
      status,
      checklistCompletion: newCompletion,
      checklistStatus,
    })
  } catch (error) {
    console.error('[onboarding-items] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
