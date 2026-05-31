import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const endpoint = body?.endpoint

    if (endpoint) {
      // Remove specific subscription
      await sql`
        DELETE FROM push_subscriptions
        WHERE user_id = ${user.id} AND endpoint = ${endpoint}
      `
    } else {
      // Remove all subscriptions for this user
      await sql`
        DELETE FROM push_subscriptions WHERE user_id = ${user.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed',
    })
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
