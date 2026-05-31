import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Slugify a name → "Ron Shenton" → "ron-shenton"
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
}

// Ensure referral code is unique — append random suffix if taken
async function ensureUniqueCode(base: string): Promise<string> {
  const existing = await sql`SELECT referral_code FROM users WHERE referral_code = ${base} LIMIT 1`
  if (existing.length === 0) return base
  const suffix = Math.random().toString(36).slice(2, 6)
  const candidate = `${base}-${suffix}`
  const again = await sql`SELECT referral_code FROM users WHERE referral_code = ${candidate} LIMIT 1`
  return again.length === 0 ? candidate : `${base}-${Date.now().toString(36).slice(-4)}`
}

// GET /api/referrals — fetch the current user's referrals + payouts + stats
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Auto-create referral code if user doesn't have one
  const userRow = await sql`SELECT referral_code, name FROM users WHERE id = ${userId} LIMIT 1`
  let code = (userRow[0] as any)?.referral_code as string | null

  if (!code) {
    const name = (userRow[0] as any)?.name ?? 'user'
    const base = slugify(name)
    code = await ensureUniqueCode(base)
    await sql`UPDATE users SET referral_code = ${code} WHERE id = ${userId}`
  }

  const [referrals, payouts, clicks] = await Promise.all([
    sql`
      SELECT r.*, u.name AS referred_name
      FROM referrals r
      LEFT JOIN users u ON u.id = r.referred_user_id
      WHERE r.referrer_id = ${userId}
      ORDER BY r.created_at DESC
    `,
    sql`
      SELECT * FROM referral_payouts
      WHERE referrer_id = ${userId}
      ORDER BY created_at DESC
    `,
    sql`
      SELECT COUNT(*) AS total
      FROM referral_clicks
      WHERE referral_code = ${code}
    `,
  ])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ipoready.vercel.app'

  return NextResponse.json({
    referralCode: code,
    referralUrl: `${baseUrl}/r/${code}`,
    referrals,
    payouts,
    totalClicks: parseInt((clicks[0] as any)?.total ?? '0'),
  })
}

// POST /api/referrals — manually add a lead
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { companyName, referredEmail } = await req.json()
  if (!referredEmail && !companyName) {
    return NextResponse.json({ error: 'Email or company name is required' }, { status: 400 })
  }

  // Get referrer's code
  const userRow = await sql`SELECT referral_code FROM users WHERE id = ${userId} LIMIT 1`
  const code = (userRow[0] as any)?.referral_code as string | null
  if (!code) return NextResponse.json({ error: 'No referral code found' }, { status: 400 })

  const inserted = await sql`
    INSERT INTO referrals (referrer_id, referral_code, referred_email, company_name, status)
    VALUES (${userId}, ${code}, ${referredEmail ?? null}, ${companyName ?? null}, 'pending')
    RETURNING *
  `

  return NextResponse.json({ referral: inserted[0] })
}
