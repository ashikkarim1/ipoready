import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CountResult {
  count: string | number
}

/**
 * GET /api/badges/counts
 * Returns all badge counts for the current user
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const companyId = user.companyId ?? null

    // ── Fetch unread notification count ──────────────────────────────────
    let unreadNotifications = 0
    try {
      const notifResult = await sql`
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ${userId} AND read = false
      ` as CountResult[]

      unreadNotifications = parseInt(notifResult[0]?.count?.toString() ?? '0', 10)
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      // Return 0 if query fails, fall back to store value
    }

    // ── Fetch overdue task count ────────────────────────────────────────
    let overdueTasks = 0
    try {
      const overdueResult = await sql`
        SELECT COUNT(*) as count
        FROM tasks
        WHERE user_id = ${userId}
          AND status != 'completed'
          AND due_date < NOW()
      ` as CountResult[]

      overdueTasks = parseInt(overdueResult[0]?.count?.toString() ?? '0', 10)
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
    }

    // ── Fetch due-soon task count (7 days) ──────────────────────────────
    let dueSoonTasks = 0
    try {
      const dueSoonResult = await sql`
        SELECT COUNT(*) as count
        FROM tasks
        WHERE user_id = ${userId}
          AND status != 'completed'
          AND due_date >= NOW()
          AND due_date < NOW() + INTERVAL '7 days'
      ` as CountResult[]

      dueSoonTasks = parseInt(dueSoonResult[0]?.count?.toString() ?? '0', 10)
    } catch (error) {
      console.error('Error fetching due-soon tasks:', error)
    }

    // ── Fetch new document count (uploaded in last 7 days) ──────────────
    let newDocuments = 0
    try {
      const docResult = await sql`
        SELECT COUNT(*) as count
        FROM documents
        WHERE company_id = ${companyId}
          AND uploaded_at > NOW() - INTERVAL '7 days'
          AND status IN ('uploaded', 'verified')
      ` as CountResult[]

      newDocuments = parseInt(docResult[0]?.count?.toString() ?? '0', 10)
    } catch (error) {
      console.error('Error fetching new documents:', error)
    }

    // ── Fetch pending invite count ──────────────────────────────────────
    let pendingInvites = 0
    try {
      const inviteResult = await sql`
        SELECT COUNT(*) as count
        FROM team_members
        WHERE user_id = ${userId}
          AND accepted_at IS NULL
      ` as CountResult[]

      pendingInvites = parseInt(inviteResult[0]?.count?.toString() ?? '0', 10)
    } catch (error) {
      console.error('Error fetching pending invites:', error)
    }

    return NextResponse.json({
      unreadNotifications,
      overdueTasks,
      dueSoonTasks,
      newDocuments,
      pendingInvites,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching badge counts:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch badge counts',
        unreadNotifications: 0,
        overdueTasks: 0,
        dueSoonTasks: 0,
        newDocuments: 0,
        pendingInvites: 0,
      },
      { status: 500 }
    )
  }
}
