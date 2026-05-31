import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXTAUTH_URL ?? 'https://ipoready.vercel.app'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const userId = (session.user as any).id as string

  const rows = await sql`
    SELECT c.stripe_customer_id
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  `

  const customerId = (rows[0] as any)?.stripe_customer_id as string | null
  if (!customerId) {
    return NextResponse.json({ error: 'No billing account found. Please subscribe first.' }, { status: 404 })
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/account?tab=billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
