import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ChecklistRow {
  completion_percentage: number
  status: string
  total_items: number
  completed_items: number
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  try {
    // Get checklist stats
    const stats = await sql`
      SELECT
        oc.completion_percentage,
        oc.status,
        COUNT(ci.id) as total_items,
        SUM(CASE WHEN ci.status = 'completed' THEN 1 ELSE 0 END) as completed_items
      FROM onboarding_checklists oc
      LEFT JOIN checklist_items ci ON oc.id = ci.checklist_id
      WHERE oc.company_id = ${companyId}
      GROUP BY oc.id, oc.completion_percentage, oc.status
    ` as ChecklistRow[]

    if (stats.length === 0) {
      return NextResponse.json({
        status: 'not_started',
        completionPercentage: 0,
        totalItems: 0,
        completedItems: 0,
      })
    }

    const stat = stats[0]
    const completionPercentage =
      stat.total_items > 0
        ? Math.round((stat.completed_items / stat.total_items) * 100)
        : 0

    return NextResponse.json({
      status: stat.status,
      completionPercentage,
      totalItems: stat.total_items,
      completedItems: stat.completed_items,
    })
  } catch (error) {
    console.error('[onboarding-progress] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
