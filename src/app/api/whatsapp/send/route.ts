import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendWhatsAppMessage } from '@/lib/whatsapp-service'
import { TemplateId } from '@/lib/whatsapp-templates'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/whatsapp/send
 * Internal endpoint to send WhatsApp messages
 * Requires valid session and Growth/Enterprise plan
 *
 * Body:
 * {
 *   phoneNumber: string (E.164 format, e.g., +16135551234)
 *   templateId: TemplateId
 *   variables: Record<string, any>
 * }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user has Growth or Enterprise plan
  const planRows = await sql`
    SELECT COALESCE(c.subscription_plan, 'starter') AS subscription_plan
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${user.id}
    LIMIT 1
  `

  if (!planRows.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const plan = (planRows[0] as any).subscription_plan
  const allowedPlans = ['growth', 'enterprise']
  if (!allowedPlans.includes(plan)) {
    return NextResponse.json(
      { error: 'WhatsApp messaging is available on Growth and Enterprise plans only' },
      { status: 403 }
    )
  }

  let body: {
    phoneNumber?: string
    templateId?: string
    variables?: Record<string, any>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { phoneNumber, templateId, variables } = body

  // Validate required fields
  if (!phoneNumber || !templateId || !variables) {
    return NextResponse.json(
      { error: 'Missing required fields: phoneNumber, templateId, variables' },
      { status: 400 }
    )
  }

  try {
    const messageId = await sendWhatsAppMessage({
      phoneNumber,
      templateId: templateId as TemplateId,
      variables,
      userId: user.id,
      companyId: user.companyId,
    })

    return NextResponse.json({
      ok: true,
      messageId,
      message: 'Message sent successfully',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[whatsapp/send]', message)

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
