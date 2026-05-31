import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface NotificationRow {
  id: string
  company_id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  link: string | null
  created_at: string
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const companyId = user.companyId ?? null

  const rows = await sql`
    SELECT id, company_id, user_id, type, title, message, read, link, created_at
    FROM notifications
    WHERE user_id = ${userId}
      ${companyId ? sql`OR company_id = ${companyId}` : sql``}
    ORDER BY created_at DESC
    LIMIT 20
  ` as NotificationRow[]

  const notifications = rows.map(r => ({
    id:        r.id,
    companyId: r.company_id,
    userId:    r.user_id,
    type:      r.type,
    title:     r.title,
    message:   r.message,
    read:      r.read,
    link:      r.link ?? undefined,
    createdAt: r.created_at,
  }))

  const unreadCount = notifications.filter(n => !n.read).length

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  let body: { markAllRead?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.markAllRead) {
    await sql`
      UPDATE notifications
      SET read = TRUE
      WHERE user_id = ${userId} AND read = FALSE
    `
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
