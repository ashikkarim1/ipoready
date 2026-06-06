import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { loadContext, processMessage } from '@/lib/ai-companion'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId    = (session.user as any).id as string
  const companyId = (session.user as any).companyId as string | null

  let body: { message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Graceful fallback when API key is not configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply:      'AI companion coming soon — add ANTHROPIC_API_KEY to enable.',
      actionsLog: [],
    })
  }

  const ctx = await loadContext(userId)
  if (!ctx) {
    return NextResponse.json({ error: 'User or company not found' }, { status: 404 })
  }

  try {
    const { reply, actionsLog } = await processMessage(ctx, message)

    // Persist both turns in ai_messages
    // Table schema: user_id, direction ('inbound'|'outbound'), channel, body, actions_taken
    await sql`
      INSERT INTO ai_messages (user_id, direction, channel, body)
      VALUES (${userId}, 'inbound', 'web', ${message})
    `
    await sql`
      INSERT INTO ai_messages (user_id, direction, channel, body, actions_taken)
      VALUES (
        ${userId},
        'outbound',
        'web',
        ${reply},
        ${actionsLog.length ? JSON.stringify(actionsLog) : null}
      )
    `

    return NextResponse.json({ reply, actionsLog })
  } catch (err: any) {
    console.error('[ai/chat] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
