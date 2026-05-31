import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const WHATSAPP_PLANS = ['growth', 'enterprise']

/**
 * GET /api/account/whatsapp
 * Returns current phone_number, whatsapp_opted_in, and plan eligibility
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT u.phone_number, u.whatsapp_opted_in,
           COALESCE(c.subscription_plan, 'starter') AS subscription_plan
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  `
  if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const r = rows[0] as { phone_number: string | null; whatsapp_opted_in: boolean; subscription_plan: string }
  return NextResponse.json({
    phoneNumber: r.phone_number ?? '',
    optedIn: r.whatsapp_opted_in ?? false,
    plan: r.subscription_plan,
    eligible: WHATSAPP_PLANS.includes(r.subscription_plan),
  })
}

/**
 * PATCH /api/account/whatsapp
 * Body: { phoneNumber: string, optedIn: boolean }
 * Requires Growth or Enterprise plan.
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Plan check — read from DB (not just JWT) so it's always fresh
  const planRows = await sql`
    SELECT COALESCE(c.subscription_plan, 'starter') AS subscription_plan
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  `
  const plan = (planRows[0] as any)?.subscription_plan ?? 'starter'
  if (!WHATSAPP_PLANS.includes(plan)) {
    return NextResponse.json(
      { error: 'WhatsApp AI Companion is available on Growth and Enterprise plans. Upgrade to enable this feature.' },
      { status: 403 }
    )
  }

  const { phoneNumber, optedIn } = await req.json()

  // Basic E.164 validation: must start with + and be 7–16 digits
  const clean = (phoneNumber ?? '').trim()
  if (clean && !/^\+\d{7,15}$/.test(clean)) {
    return NextResponse.json({ error: 'Phone number must be in E.164 format, e.g. +16135551234' }, { status: 400 })
  }

  await sql`
    UPDATE users
    SET phone_number      = ${clean || null},
        whatsapp_opted_in = ${!!optedIn}
    WHERE id = ${userId}
  `

  return NextResponse.json({ ok: true })
}
