import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredSubscriptions } from '@/lib/push-sender'

export const dynamic = 'force-dynamic'

/**
 * GET /api/push/cron/cleanup-subscriptions
 * Clean up push subscriptions that haven't been used for 30+ days
 * Recommended: Run daily at a quiet time (e.g., 2am UTC)
 * Secured by CRON_SECRET in Authorization header
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deletedCount = await cleanupExpiredSubscriptions()

    return NextResponse.json({
      ok: true,
      cleaned: deletedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/cleanup-subscriptions]', err)

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
