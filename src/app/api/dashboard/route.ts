import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { computeAndUpdateCompanyStats } from '@/lib/company-stats'

export const dynamic = 'force-dynamic'

interface CompanyRow {
  id: string
  name: string
  listing_type: string
  target_exchange: string
  current_phase: string
  pace_score: number
  estimated_days_to_ipo: number
  progress_percentage: number
  currency: string
  language: string
  created_at: string
}

interface TaskStatusCountRow {
  status: string
  count: string
}

interface PhaseCountRow {
  phase: string
  total: string
  completed: string
}

interface UpcomingTaskRow {
  id: string
  phase: string
  category: string
  title: string
  priority: string
  estimated_days: number
}

interface RecentActivityRow {
  id: string
  title: string
  phase: string
  completed_at: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // 1. Company data
  const companyRows = await sql`
    SELECT id, name, listing_type, target_exchange, current_phase, pace_score,
           estimated_days_to_ipo, progress_percentage, currency, language, created_at
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  ` as CompanyRow[]

  if (companyRows.length === 0) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const companyRow = companyRows[0]

  // Compute and update stats
  const stats = await computeAndUpdateCompanyStats(companyId)

  // 2. Tasks summary
  const statusCountRows = await sql`
    SELECT status, COUNT(*) AS count
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY status
  ` as TaskStatusCountRow[]

  const statusMap: Record<string, number> = {}
  for (const row of statusCountRows) {
    statusMap[row.status] = parseInt(row.count, 10)
  }

  const total = Object.values(statusMap).reduce((sum, n) => sum + n, 0)
  const tasksSummary = {
    total,
    completed: statusMap['completed'] ?? 0,
    inProgress: statusMap['in_progress'] ?? 0,
    blocked: statusMap['blocked'] ?? 0,
    notStarted: statusMap['not_started'] ?? 0,
  }

  // 3. Phase data
  const phaseCountRows = await sql`
    SELECT
      phase,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed
    FROM tasks
    WHERE company_id = ${companyId}
    GROUP BY phase
    ORDER BY phase
  ` as PhaseCountRow[]

  const phaseData = phaseCountRows.map(row => {
    const phaseTotal = parseInt(row.total, 10)
    const phaseCompleted = parseInt(row.completed, 10)
    return {
      phase: row.phase,
      total: phaseTotal,
      completed: phaseCompleted,
      percentage: phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0,
    }
  })

  // 4. Upcoming tasks (top 5 not started or in progress, ordered by priority then order_index)
  const upcomingRows = await sql`
    SELECT id, phase, category, title, priority, estimated_days
    FROM tasks
    WHERE company_id = ${companyId}
      AND status IN ('not_started', 'in_progress')
    ORDER BY
      CASE priority
        WHEN 'critical' THEN 0
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        ELSE 3
      END,
      order_index
    LIMIT 5
  ` as UpcomingTaskRow[]

  const upcomingTasks = upcomingRows.map(row => ({
    id: row.id,
    phase: row.phase,
    category: row.category,
    title: row.title,
    priority: row.priority,
    estimatedDays: row.estimated_days,
  }))

  // 5. Recent activity (last 5 completed tasks)
  const recentRows = await sql`
    SELECT id, title, phase, completed_at
    FROM tasks
    WHERE company_id = ${companyId}
      AND status = 'completed'
      AND completed_at IS NOT NULL
    ORDER BY completed_at DESC
    LIMIT 5
  ` as RecentActivityRow[]

  const recentActivity = recentRows.map(row => ({
    id: row.id,
    title: row.title,
    phase: row.phase,
    completedAt: row.completed_at,
  }))

  return NextResponse.json({
    company: {
      id: companyRow.id,
      name: companyRow.name,
      listingType: companyRow.listing_type,
      targetExchange: companyRow.target_exchange,
      currentPhase: stats.currentPhase,
      paceScore: stats.paceScore,
      estimatedDaysToIpo: stats.estimatedDaysToIpo,
      progressPercentage: stats.progressPercentage,
      currency: companyRow.currency,
      language: companyRow.language,
      createdAt: companyRow.created_at,
    },
    tasksSummary,
    phaseData,
    upcomingTasks,
    recentActivity,
  })
}
