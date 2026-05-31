import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/referrals/stats — aggregate stats for the dashboard cards
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userRow = await sql`SELECT referral_code FROM users WHERE id = ${userId} LIMIT 1`
  const code = (userRow[0] as any)?.referral_code as string | null

  const [refStats, payoutStats, clickStats] = await Promise.all([
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'converted')  AS converted,
        COUNT(*) FILTER (WHERE status = 'signed_up')  AS signed_up,
        COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
        COALESCE(SUM(commission_paid_cad), 0)         AS total_paid,
        COALESCE(SUM(commission_pending_cad), 0)      AS total_pending,
        COALESCE(SUM(commission_monthly_cad), 0)      AS monthly_recurring
      FROM referrals
      WHERE referrer_id = ${userId}
    `,
    sql`
      SELECT COALESCE(SUM(amount_cad), 0) AS lifetime_paid
      FROM referral_payouts
      WHERE referrer_id = ${userId} AND status = 'paid'
    `,
    code
      ? sql`SELECT COUNT(*) AS total FROM referral_clicks WHERE referral_code = ${code}`
      : Promise.resolve([{ total: 0 }]),
  ])

  const r = refStats[0] as any
  const p = payoutStats[0] as any
  const c = clickStats[0] as any

  return NextResponse.json({
    converted:        parseInt(r.converted ?? '0'),
    signedUp:         parseInt(r.signed_up ?? '0'),
    pending:          parseInt(r.pending ?? '0'),
    totalPaidCAD:     parseFloat(p.lifetime_paid ?? '0'),
    totalPendingCAD:  parseFloat(r.total_pending ?? '0'),
    monthlyRecurring: parseFloat(r.monthly_recurring ?? '0'),
    totalClicks:      parseInt(c.total ?? '0'),
  })
}
