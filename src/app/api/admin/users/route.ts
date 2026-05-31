import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

function assertAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session || !(session as any).user || ((session as any).user as any).role !== 'system_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const err = assertAdmin(session)
  if (err) return err

  const rows = await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.is_approved,
      u.created_at,
      u.phone_number,
      u.whatsapp_opted_in,
      c.id           AS company_id,
      c.name         AS company_name,
      c.listing_type,
      c.target_exchange,
      c.subscription_plan,
      c.stripe_customer_id,
      c.stripe_subscription_id,
      c.plan_expires_at
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    ORDER BY u.created_at DESC
  `

  return NextResponse.json({ users: rows })
}
