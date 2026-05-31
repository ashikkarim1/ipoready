import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_ACCESS_LEVELS = ['admin', 'manager', 'reviewer', 'viewer'] as const
const VALID_JOB_TITLES = [
  'system_admin', 'ceo', 'cfo', 'coo', 'legal_counsel', 'auditor',
  'go_public_advisor', 'ir_manager', 'board_member', 'compliance_officer',
  'finance_manager', 'capital_markets', 'read_only',
] as const

type AccessLevel = typeof VALID_ACCESS_LEVELS[number]
type JobTitle    = typeof VALID_JOB_TITLES[number]

interface UserLookupRow {
  id: string
  email: string
  name: string
  company_id: string | null
}

interface InsertedRow {
  id: string
  company_id: string
  user_id: string | null
  access_level: string
  job_title: string | null
  notification_frequency: string
  invited_at: string
  accepted_at: string | null
  pending_email: string | null
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !sessionUser?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = sessionUser.companyId

  let body: { email?: unknown; role?: unknown; accessLevel?: unknown; jobTitle?: unknown; notificationFrequency?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  // Support both `role` and `accessLevel` field names from the client
  const accessLevel = (body.accessLevel ?? body.role) as AccessLevel | undefined
  const jobTitle    = (body.jobTitle ?? 'read_only') as JobTitle
  const notifFreq   = typeof body.notificationFrequency === 'string'
    ? body.notificationFrequency
    : 'weekly'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!accessLevel || !VALID_ACCESS_LEVELS.includes(accessLevel)) {
    return NextResponse.json({ error: `accessLevel must be one of: ${VALID_ACCESS_LEVELS.join(', ')}` }, { status: 400 })
  }

  // Look up whether this email already has a user account
  const existingUsers = await sql`
    SELECT id, email, name, company_id FROM users WHERE email = ${email} LIMIT 1
  ` as UserLookupRow[]

  const existingUser = existingUsers[0] ?? null

  // Build insert params
  const userId      = existingUser?.id ?? null
  const pendingEmail = existingUser ? null : email

  // Check for duplicate within this company
  if (userId) {
    const dupUser = await sql`
      SELECT id FROM team_members
      WHERE company_id = ${companyId} AND user_id = ${userId}
      LIMIT 1
    `
    if (dupUser.length > 0) {
      return NextResponse.json({ error: 'This person is already a team member' }, { status: 409 })
    }
  } else {
    const dupEmail = await sql`
      SELECT id FROM team_members
      WHERE company_id = ${companyId} AND pending_email = ${email}
      LIMIT 1
    `
    if (dupEmail.length > 0) {
      return NextResponse.json({ error: 'An invite has already been sent to this email' }, { status: 409 })
    }
  }

  // Insert into team_members
  const inserted = await sql`
    INSERT INTO team_members (
      company_id, user_id, access_level, job_title,
      notification_frequency, invited_at, pending_email
    )
    VALUES (
      ${companyId},
      ${userId},
      ${accessLevel},
      ${jobTitle},
      ${notifFreq},
      NOW(),
      ${pendingEmail}
    )
    RETURNING id, company_id, user_id, access_level, job_title,
              notification_frequency, invited_at, accepted_at, pending_email
  ` as InsertedRow[]

  const row = inserted[0]
  const memberEmail = existingUser?.email ?? email
  const memberName  = existingUser?.name  ?? 'Pending Invite'
  const initials = existingUser?.name
    ? existingUser.name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : email.slice(0, 2).toUpperCase()

  return NextResponse.json({
    member: {
      id: row.id,
      userId: row.user_id,
      name: memberName,
      email: memberEmail,
      accessLevel: row.access_level,
      jobTitle: row.job_title ?? 'read_only',
      notificationFrequency: row.notification_frequency,
      status: 'pending',
      initials,
      joinedAt: row.invited_at,
    },
  }, { status: 201 })
}
