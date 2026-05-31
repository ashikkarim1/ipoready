import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/referrals/track
// Called when someone lands on /r/[slug] — logs a click
export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

  // Verify the code exists
  const exists = await sql`SELECT id FROM users WHERE referral_code = ${code} LIMIT 1`
  if (exists.length === 0) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  // Hash IP for privacy — not stored raw
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ipHash = createHash('sha256').update(ip + code).digest('hex').slice(0, 16)
  const ua = (req.headers.get('user-agent') ?? '').slice(0, 200)

  await sql`
    INSERT INTO referral_clicks (referral_code, ip_hash, user_agent)
    VALUES (${code}, ${ipHash}, ${ua})
  `

  return NextResponse.json({ ok: true })
}
