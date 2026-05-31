import { NextRequest, NextResponse } from 'next/server'
import { sendTaskReminders } from '@/lib/whatsapp-scheduler'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/cron/task-reminders
 * Send task reminder notifications to opted-in users
 * Recommended: Run daily at 9am user's local timezone
 * Secured by CRON_SECRET in Authorization header
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendTaskReminders()

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/task-reminders]', err)
    return NextResponse.json(
      { error: 'Failed to send task reminders' },
      { status: 500 }
    )
  }
}
