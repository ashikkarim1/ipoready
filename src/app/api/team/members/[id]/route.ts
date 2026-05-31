import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_ACCESS_LEVELS = ['admin', 'manager', 'reviewer', 'viewer'] as const
type AccessLevel = typeof VALID_ACCESS_LEVELS[number]

interface MemberOwnerRow {
  id: string
  company_id: string
  user_id: string | null
  access_level: string
}

// ── PATCH /api/team/members/[id] — update access level ───────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !sessionUser?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = sessionUser.companyId
  const { id: memberId } = await params

  let body: { accessLevel?: unknown; notificationFrequency?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const accessLevel = body.accessLevel as AccessLevel | undefined
  if (!accessLevel || !VALID_ACCESS_LEVELS.includes(accessLevel)) {
    return NextResponse.json({ error: `accessLevel must be one of: ${VALID_ACCESS_LEVELS.join(', ')}` }, { status: 400 })
  }

  // Verify the member belongs to this company
  const rows = await sql`
    SELECT id, company_id, user_id, access_level
    FROM team_members
    WHERE id = ${memberId}
    LIMIT 1
  ` as MemberOwnerRow[]

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  if (rows[0].company_id !== companyId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // If downgrading to non-admin, ensure at least one other admin remains
  if (accessLevel !== 'admin') {
    const adminCount = await sql`
      SELECT COUNT(*) AS cnt FROM team_members
      WHERE company_id = ${companyId} AND access_level = 'admin'
    `
    const cnt = parseInt((adminCount[0] as any).cnt, 10)
    if (cnt <= 1 && rows[0].access_level === 'admin') {
      return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 409 })
    }
  }

  const updated = await sql`
    UPDATE team_members
    SET access_level = ${accessLevel}
    WHERE id = ${memberId}
    RETURNING id, access_level
  `

  return NextResponse.json({ member: { id: (updated[0] as any).id, accessLevel: (updated[0] as any).access_level } })
}

// ── DELETE /api/team/members/[id] — remove a member ──────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !sessionUser?.companyId || !sessionUser?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId  = sessionUser.companyId
  const currentUserId = sessionUser.id
  const { id: memberId } = await params

  // Fetch the member row
  const rows = await sql`
    SELECT id, company_id, user_id, access_level
    FROM team_members
    WHERE id = ${memberId}
    LIMIT 1
  ` as MemberOwnerRow[]

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  if (rows[0].company_id !== companyId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Cannot remove yourself
  if (rows[0].user_id === currentUserId) {
    return NextResponse.json({ error: 'You cannot remove yourself from the team' }, { status: 409 })
  }

  // Cannot remove the last admin
  if (rows[0].access_level === 'admin') {
    const adminCount = await sql`
      SELECT COUNT(*) AS cnt FROM team_members
      WHERE company_id = ${companyId} AND access_level = 'admin'
    `
    const cnt = parseInt((adminCount[0] as any).cnt, 10)
    if (cnt <= 1) {
      return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 409 })
    }
  }

  await sql`DELETE FROM team_members WHERE id = ${memberId}`

  return NextResponse.json({ success: true })
}
