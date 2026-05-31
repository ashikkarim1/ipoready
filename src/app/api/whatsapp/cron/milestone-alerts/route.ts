import { NextRequest, NextResponse } from 'next/server'
import { sendMilestoneAlerts } from '@/lib/whatsapp-scheduler'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/cron/milestone-alerts
 * Send milestone progress alerts to opted-in users
 * Recommended: Run hourly to catch recent milestone updates
 * Secured by CRON_SECRET in Authorization header
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendMilestoneAlerts()

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/milestone-alerts]', err)
    return NextResponse.json(
      { error: 'Failed to send milestone alerts' },
      { status: 500 }
    )
  }
}
