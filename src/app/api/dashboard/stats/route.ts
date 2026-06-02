import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CountRow {
  count: string
}

interface PhaseRow {
  phase: string
  total: string
  completed: string
}

interface UpcomingTaskRow {
  id: string
  title: string
  phase: string
  priority: string
  due_date: string | null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // 1. Total tasks
  const totalRows = await sql`
    SELECT COUNT(*) AS count FROM tasks WHERE company_id = ${companyId}
  ` as CountRow[]
  const totalTasks = parseInt(totalRows[0]?.count ?? '0', 10)

  // 2. Completed tasks
  const completedRows = await sql`
    SELECT COUNT(*) AS count FROM tasks
    WHERE company_id = ${companyId} AND status = 'completed'
  ` as CountRow[]
  const completedTasks = parseInt(completedRows[0]?.count ?? '0', 10)

  // 3. Overdue tasks (due_date in the past, not completed)
  const overdueRows = await sql`
    SELECT COUNT(*) AS count FROM tasks
    WHERE company_id = ${companyId}
      AND status != 'completed'
      AND due_date IS NOT NULL
      AND due_date < CURRENT_DATE
  ` as CountRow[]
  const overdueTasks = parseInt(overdueRows[0]?.count ?? '0', 10)

  // 4. Team members count (users who have accepted their invitation)
  const teamRows = await sql`
    SELECT COUNT(*) AS count FROM team_members
    WHERE company_id = ${companyId}
      AND accepted_at IS NOT NULL
  ` as CountRow[]
  const teamMembersCount = parseInt(teamRows[0]?.count ?? '0', 10)

  // 5. Documents uploaded
  const docsRows = await sql`
    SELECT COUNT(*) AS count FROM documents WHERE company_id = ${companyId}
  ` as CountRow[]
  const documentsCount = parseInt(docsRows[0]?.count ?? '0', 10)

  // 6. Upcoming deadlines in next 14 days (not completed)
  const upcomingRows = await sql`
    SELECT id, title, phase, priority, due_date
    FROM tasks
    WHERE company_id = ${companyId}
      AND status != 'completed'
      AND due_date IS NOT NULL
      AND due_date >= CURRENT_DATE
      AND due_date <= CURRENT_DATE + INTERVAL '14 days'
    ORDER BY due_date ASC, priority ASC
    LIMIT 10
  ` as UpcomingTaskRow[]

  const upcomingDeadlines = upcomingRows.map(row => ({
    id: row.id,
    title: row.title,
    phase: row.phase,
    priority: row.priority,
    dueDate: row.due_date,
  }))

  // 7. Prospectus builder status
  const prospectusRows = await sql`
    SELECT 
      id,
      status,
      completion_pct,
      sections_complete,
      sections_total
    FROM prospectuses
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
    LIMIT 1
  ` as { id: string; status: string; completion_pct: number; sections_complete: number; sections_total: number }[]
  
  const prospectusStatus = prospectusRows[0]?.status ?? null
  const prospectusCompletion = prospectusRows[0]?.completion_pct ?? 0
  const prospectusSectionsComplete = prospectusRows[0]?.sections_complete ?? 0
  const prospectusSectionsTotal = prospectusRows[0]?.sections_total ?? 0

  // 8. Current phase + phase progress from tasks
  const phaseRows = await sql`
    SELECT
      phase,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
  ` as PhaseRow[]

  // Determine current phase: lowest-progress non-100% phase
  const phaseProgress: Record<string, { total: number; completed: number; percentage: number }> = {}
  for (const row of phaseRows) {
    const t = parseInt(row.total, 10)
    const c = parseInt(row.completed, 10)
    phaseProgress[row.phase] = {
      total: t,
      completed: c,
      percentage: t > 0 ? Math.round((c / t) * 100) : 0,
    }
  }

  // 9. Company current_phase field
  const companyRows = await sql`
    SELECT current_phase FROM companies WHERE id = ${companyId} LIMIT 1
  ` as { current_phase: string | null }[]
  const currentPhase = companyRows[0]?.current_phase ?? null

  return NextResponse.json({
    totalTasks,
    completedTasks,
    overdueTasks,
    teamMembersCount,
    documentsCount,
    prospectusStatus,
    prospectusCompletion,
    prospectusSectionsComplete,
    prospectusSectionsTotal,
    upcomingDeadlines,
    currentPhase,
    phaseProgress,
  })
}
