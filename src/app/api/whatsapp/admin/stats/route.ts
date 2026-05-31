import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getQueueStats } from '@/lib/whatsapp-queue'
import { getCompanyMessageStats } from '@/lib/whatsapp-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/admin/stats
 * Get WhatsApp system statistics
 * Admin only endpoint for monitoring and debugging
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const adminRows = await sql`
    SELECT role FROM users WHERE id = ${user.id}
  `

  if (!adminRows.length || (adminRows[0] as any).role !== 'system_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Get overall stats
    const logStats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued
      FROM whatsapp_logs
    `

    const queueStats = await getQueueStats()

    // Get stats by template
    const templateStats = await sql`
      SELECT
        template_id,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_delivery_seconds
      FROM whatsapp_logs
      WHERE sent_at IS NOT NULL
      GROUP BY template_id
      ORDER BY count DESC
    `

    // Get recent failures
    const failures = await sql`
      SELECT
        id,
        phone_number,
        template_id,
        error,
        created_at
      FROM whatsapp_logs
      WHERE status = 'failed'
      ORDER BY created_at DESC
      LIMIT 10
    `

    const logs = logStats[0] as any
    return NextResponse.json({
      logs: {
        total: Number(logs.total),
        sent: Number(logs.sent),
        delivered: Number(logs.delivered),
        failed: Number(logs.failed),
        queued: Number(logs.queued),
      },
      queue: queueStats,
      templates: (templateStats as any[]).map(t => ({
        templateId: t.template_id,
        count: Number(t.count),
        delivered: Number(t.delivered),
        failed: Number(t.failed),
        avgDeliverySeconds: t.avg_delivery_seconds ? Number(t.avg_delivery_seconds) : null,
      })),
      recentFailures: (failures as any[]).map(f => ({
        id: f.id,
        phoneNumber: f.phone_number,
        templateId: f.template_id,
        error: f.error,
        createdAt: f.created_at,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[whatsapp/admin/stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
