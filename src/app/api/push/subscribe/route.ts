import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id
  if (!session || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let subscription: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } = {}
  try {
    subscription = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription — endpoint required' }, { status: 400 })
  }

  const { endpoint, keys } = subscription
  const p256dh = keys?.p256dh ?? null
  const auth   = keys?.auth   ?? null

  // Upsert — one row per (user_id, endpoint)
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${userId}, ${endpoint}, ${p256dh}, ${auth})
    ON CONFLICT (user_id, endpoint)
    DO UPDATE SET
      p256dh     = EXCLUDED.p256dh,
      auth       = EXCLUDED.auth,
      created_at = now()
  `

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string })?.id
  if (!session || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Optional: pass endpoint in body to remove a specific subscription,
  // otherwise remove ALL subscriptions for this user (e.g. browser cleared)
  let endpoint: string | null = null
  try {
    const body = await req.json()
    endpoint = body?.endpoint ?? null
  } catch {
    // no body — delete all
  }

  if (endpoint) {
    await sql`
      DELETE FROM push_subscriptions
      WHERE user_id = ${userId} AND endpoint = ${endpoint}
    `
  } else {
    await sql`
      DELETE FROM push_subscriptions WHERE user_id = ${userId}
    `
  }

  return NextResponse.json({ success: true })
}
