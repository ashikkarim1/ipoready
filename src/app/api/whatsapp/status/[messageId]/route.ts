import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMessageStatus } from '@/lib/whatsapp-service'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/status/:messageId
 * Check delivery status of a WhatsApp message
 * User can only check status of their own messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const messageId = params.messageId

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
  }

  try {
    // Verify user owns this message
    const rows = await sql`
      SELECT user_id FROM whatsapp_logs WHERE id = ${messageId}
      LIMIT 1
    `

    if (!rows.length) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const msg = rows[0] as { user_id: string | null }
    if (msg.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get status
    const status = await getMessageStatus(messageId)

    return NextResponse.json({
      id: status.id,
      status: status.status,
      sentAt: status.sentAt,
      deliveredAt: status.deliveredAt,
      failedAt: status.failedAt,
      error: status.error,
    })
  } catch (err) {
    console.error('[whatsapp/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
