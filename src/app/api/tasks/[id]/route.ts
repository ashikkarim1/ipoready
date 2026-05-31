import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { computeAndUpdateCompanyStats } from '@/lib/company-stats'

export const dynamic = 'force-dynamic'

type TaskStatusValue = 'not_started' | 'in_progress' | 'completed' | 'blocked'

interface TaskOwnerRow {
  id: string
  company_id: string
}

interface UpdatedTaskRow {
  id: string
  status: string
  completed_at: string | null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId
  const { id: taskId } = await params

  // Parse and validate body
  let body: { status?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validStatuses: TaskStatusValue[] = ['not_started', 'in_progress', 'completed', 'blocked']
  const status = body.status as string

  if (!status || !validStatuses.includes(status as TaskStatusValue)) {
    return NextResponse.json(
      { error: `status must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    )
  }

  // Verify task belongs to this company (security check)
  const ownerRows = await sql`
    SELECT id, company_id FROM tasks WHERE id = ${taskId} LIMIT 1
  ` as TaskOwnerRow[]

  if (ownerRows.length === 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (ownerRows[0].company_id !== companyId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update task — set completed_at when completed, clear it otherwise
  let updatedRows: UpdatedTaskRow[]

  if (status === 'completed') {
    updatedRows = await sql`
      UPDATE tasks
      SET status = ${status}, completed_at = NOW()
      WHERE id = ${taskId}
      RETURNING id, status, completed_at
    ` as UpdatedTaskRow[]
  } else {
    updatedRows = await sql`
      UPDATE tasks
      SET status = ${status}, completed_at = NULL
      WHERE id = ${taskId}
      RETURNING id, status, completed_at
    ` as UpdatedTaskRow[]
  }

  const updatedTask = updatedRows[0]

  // Recompute and update company stats
  await computeAndUpdateCompanyStats(companyId)

  return NextResponse.json({
    task: {
      id: updatedTask.id,
      status: updatedTask.status,
      completedAt: updatedTask.completed_at,
    },
  })
}
