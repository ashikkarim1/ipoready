import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Palette to derive a deterministic color from a team member's id
const AVATAR_COLORS = ['#1D4ED8', '#2D7A5F', '#B45309', '#7C3AED', '#BE185D']

function colorFromId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

interface HistoryRow {
  id: string
  pace_score: string
  progress_percentage: string
  recorded_at: string
}

interface TeamMemberRow {
  id: string
  role: string
  job_title: string | null
  name: string | null
  email: string | null
}

interface CompanyPulseRow {
  pulse_paused: boolean
  pulse_hour: number
  pulse_language: string
  pulse_weekend: boolean
}

// ── GET /api/pace/pulse ──────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // 0. Load persisted pulse settings
  const settingsRows = await sql`
    SELECT pulse_paused, pulse_hour, pulse_language, pulse_weekend
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  ` as CompanyPulseRow[]

  const settings = settingsRows[0] ?? {
    pulse_paused: false,
    pulse_hour: 7,
    pulse_language: 'EN',
    pulse_weekend: false,
  }

  // 1. Last 14 daily snapshots (desc so we can compute change vs. next row)
  const rawHistory = await sql`
    SELECT id, pace_score, progress_percentage, recorded_at
    FROM pace_score_history
    WHERE company_id = ${companyId}
    ORDER BY recorded_at DESC
    LIMIT 14
  ` as HistoryRow[]

  // Build history array (oldest→newest for the table)
  const history = rawHistory
    .slice()
    .reverse()
    .map((row, i, arr) => {
      const score = parseInt(row.pace_score, 10)
      const prevScore = i > 0 ? parseInt(arr[i - 1].pace_score, 10) : score
      const delta = score - prevScore
      const changeStr = delta > 0 ? `+${delta}` : delta === 0 ? '+0' : `${delta}`
      const dateLabel = new Date(row.recorded_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })

      return {
        date: dateLabel,
        score,
        change: changeStr,
        blocker: '—',          // placeholder — requires phase data cross-join
        completed: 0,          // placeholder — requires task completion log
        status: 'Delivered' as const,
      }
    })
    // Reverse back so newest day is first (matches original mock order)
    .reverse()

  // 2. Current score — latest record
  const currentScore =
    rawHistory.length > 0 ? parseInt(rawHistory[0].pace_score, 10) : 0

  // 3. Recipients — accepted team members with a user account
  const memberRows = await sql`
    SELECT tm.id, tm.role, tm.job_title,
           u.name, u.email
    FROM team_members tm
    LEFT JOIN users u ON u.id = tm.user_id
    WHERE tm.company_id = ${companyId}
      AND tm.accepted_at IS NOT NULL
  ` as TeamMemberRow[]

  const recipients = memberRows.map(row => {
    const name = row.name ?? row.email ?? row.role
    return {
      id: row.id,
      initials: initialsFromName(name),
      name,
      title: row.job_title ?? row.role,
      color: colorFromId(row.id),
    }
  })

  return NextResponse.json({
    history,
    recipients,
    currentScore,
    paused: settings.pulse_paused,
    hour: settings.pulse_hour,
    language: settings.pulse_language as 'EN' | 'FR',
    weekendPulse: settings.pulse_weekend,
  })
}

// ── PUT /api/pace/pulse ──────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // Parse and validate body — all fields optional
  let body: { paused?: boolean; hour?: number; language?: string; weekendPulse?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine — treat as no-op
  }

  const {
    paused,
    hour,
    language,
    weekendPulse,
  } = body

  // Validate ranges
  if (hour !== undefined && (typeof hour !== 'number' || hour < 0 || hour > 23)) {
    return NextResponse.json({ error: 'hour must be 0–23' }, { status: 400 })
  }
  if (language !== undefined && !['EN', 'FR'].includes(language)) {
    return NextResponse.json({ error: 'language must be EN or FR' }, { status: 400 })
  }

  // Persist to companies table (COALESCE preserves unchanged fields)
  await sql`
    UPDATE companies
    SET
      pulse_paused   = COALESCE(${paused   ?? null}, pulse_paused),
      pulse_hour     = COALESCE(${hour     ?? null}, pulse_hour),
      pulse_language = COALESCE(${language ?? null}, pulse_language),
      pulse_weekend  = COALESCE(${weekendPulse ?? null}, pulse_weekend)
    WHERE id = ${companyId}
  `

  return NextResponse.json({ ok: true })
}
