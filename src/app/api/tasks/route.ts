import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface TaskRow {
  id: string
  phase: string
  category: string
  title: string
  description: string
  status: string
  priority: string
  estimated_days: number
  order_index: number
  completed_at: string | null
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId
  const { searchParams } = new URL(request.url)
  const phaseFilter = searchParams.get('phase')
  const statusFilter = searchParams.get('status')

  let rows: TaskRow[]

  if (phaseFilter && statusFilter) {
    rows = await sql`
      SELECT id, phase, category, title, description, status, priority,
             estimated_days, order_index, completed_at
      FROM tasks
      WHERE company_id = ${companyId}
        AND phase = ${phaseFilter}
        AND status = ${statusFilter}
      ORDER BY order_index ASC, phase ASC
    ` as TaskRow[]
  } else if (phaseFilter) {
    rows = await sql`
      SELECT id, phase, category, title, description, status, priority,
             estimated_days, order_index, completed_at
      FROM tasks
      WHERE company_id = ${companyId}
        AND phase = ${phaseFilter}
      ORDER BY order_index ASC, phase ASC
    ` as TaskRow[]
  } else if (statusFilter) {
    rows = await sql`
      SELECT id, phase, category, title, description, status, priority,
             estimated_days, order_index, completed_at
      FROM tasks
      WHERE company_id = ${companyId}
        AND status = ${statusFilter}
      ORDER BY order_index ASC, phase ASC
    ` as TaskRow[]
  } else {
    rows = await sql`
      SELECT id, phase, category, title, description, status, priority,
             estimated_days, order_index, completed_at
      FROM tasks
      WHERE company_id = ${companyId}
      ORDER BY order_index ASC, phase ASC
    ` as TaskRow[]
  }

  const tasks = rows.map(row => ({
    id: row.id,
    phase: row.phase,
    category: row.category,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    estimatedDays: row.estimated_days,
    orderIndex: row.order_index,
    completedAt: row.completed_at,
  }))

  return NextResponse.json(
    { tasks },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    }
  )
}
