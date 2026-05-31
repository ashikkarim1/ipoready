import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface MemberRow {
  id: string
  company_id: string
  user_id: string | null
  access_level: string
  job_title: string | null
  notification_frequency: string
  invited_at: string
  accepted_at: string | null
  pending_email: string | null
  user_name: string | null
  user_email: string | null
}

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  const rows = await sql`
    SELECT
      tm.id,
      tm.company_id,
      tm.user_id,
      tm.access_level,
      tm.job_title,
      tm.notification_frequency,
      tm.invited_at,
      tm.accepted_at,
      tm.pending_email,
      u.name  AS user_name,
      u.email AS user_email
    FROM team_members tm
    LEFT JOIN users u ON u.id = tm.user_id
    WHERE tm.company_id = ${companyId}
    ORDER BY tm.invited_at ASC
  ` as MemberRow[]

  const members = rows.map((row) => {
    const isPending = row.accepted_at === null
    const email = row.user_email ?? row.pending_email ?? ''
    const name = row.user_name ?? (isPending ? 'Pending Invite' : email)
    const initials = row.user_name
      ? row.user_name
          .split(' ')
          .slice(0, 2)
          .map((p) => p[0])
          .join('')
          .toUpperCase()
      : email.slice(0, 2).toUpperCase()

    return {
      id: row.id,
      userId: row.user_id,
      name,
      email,
      accessLevel: row.access_level,
      jobTitle: row.job_title ?? 'read_only',
      notificationFrequency: row.notification_frequency,
      status: isPending ? 'pending' : 'active',
      initials,
      joinedAt: row.invited_at,
    }
  })

  return NextResponse.json({ members }, { headers: { 'Cache-Control': 'private, no-store' } })
}
