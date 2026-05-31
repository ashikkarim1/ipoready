import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CountResult {
  count: string | number
}

/**
 * GET /api/tasks/overdue-count
 * Returns the count of overdue tasks for the current user
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const result = await sql`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE user_id = ${userId}
        AND status != 'completed'
        AND due_date < NOW()
    ` as CountResult[]

    const overdueTasks = parseInt(result[0]?.count?.toString() ?? '0', 10)

    return NextResponse.json({
      overdueTasks,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching overdue task count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overdue task count', overdueTasks: 0 },
      { status: 500 }
    )
  }
}
