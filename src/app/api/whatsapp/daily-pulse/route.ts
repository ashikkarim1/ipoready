import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendWhatsApp } from '@/lib/whatsapp'
import { loadContext, buildDailyPulse } from '@/lib/ai-companion'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/daily-pulse
 *
 * Called by a cron job every morning (e.g. 7:00 AM ET).
 * Secured by a shared secret in the Authorization header:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Sends the PACE™ daily briefing to every user with whatsapp_opted_in = TRUE.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch opted-in users on Growth or Enterprise plans only
  const users = await sql`
    SELECT u.id, u.phone_number FROM users u
    JOIN companies c ON c.id = u.company_id
    WHERE u.whatsapp_opted_in = TRUE
      AND u.phone_number IS NOT NULL
      AND u.phone_number != ''
      AND c.subscription_plan IN ('growth', 'enterprise')
  `

  const results = { sent: 0, failed: 0, skipped: 0 }

  for (const row of users as { id: string; phone_number: string }[]) {
    try {
      const ctx = await loadContext(row.id)
      if (!ctx) { results.skipped++; continue }

      const message = await buildDailyPulse(ctx)
      await sendWhatsApp(row.phone_number, message)

      // Log outbound
      await sql`
        INSERT INTO ai_messages (user_id, direction, channel, body)
        VALUES (${row.id}, 'outbound', 'whatsapp', ${message})
      `

      results.sent++
    } catch (err) {
      console.error(`[daily-pulse] failed for user ${row.id}:`, err)
      results.failed++
    }
  }

  return NextResponse.json({ ok: true, ...results, timestamp: new Date().toISOString() })
}
