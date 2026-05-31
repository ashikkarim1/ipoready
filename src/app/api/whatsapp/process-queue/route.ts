import { NextRequest, NextResponse } from 'next/server'
import { processQueue, getQueueStats } from '@/lib/whatsapp-queue'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/process-queue
 * Process the WhatsApp message queue
 * Secured by CRON_SECRET in Authorization header
 * Should be called every 5 seconds by a cron job
 *
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processQueue()
    const stats = await getQueueStats()

    return NextResponse.json({
      ok: true,
      result: {
        processed: result.processed,
        failed: result.failed,
        rateLimited: result.rateLimited,
      },
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[whatsapp/process-queue]', err)
    return NextResponse.json(
      { error: 'Failed to process queue' },
      { status: 500 }
    )
  }
}
