import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/whatsapp/preferences
 * Get user's WhatsApp preferences (phone number, opted in status)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await sql`
      SELECT
        u.phone_number,
        u.whatsapp_opted_in,
        COALESCE(c.subscription_plan, 'starter') AS subscription_plan
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE u.id = ${user.id}
      LIMIT 1
    `

    if (!rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const row = rows[0] as any
    return NextResponse.json({
      phoneNumber: row.phone_number || '',
      optedIn: row.whatsapp_opted_in || false,
      plan: row.subscription_plan,
      eligible: ['growth', 'enterprise'].includes(row.subscription_plan),
    })
  } catch (err) {
    console.error('[whatsapp/preferences GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/whatsapp/opt-in
 * User opts in to WhatsApp notifications
 * Body: { phoneNumber: string, companyId?: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { phoneNumber?: string; companyId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { phoneNumber, companyId } = body

  if (!phoneNumber || !phoneNumber.trim()) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  // Validate E.164 format
  const clean = phoneNumber.trim()
  if (!/^\+\d{7,15}$/.test(clean)) {
    return NextResponse.json(
      { error: 'Phone number must be in E.164 format, e.g., +16135551234' },
      { status: 400 }
    )
  }

  // Check user's subscription plan
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
  if (!['growth', 'enterprise'].includes(plan)) {
    return NextResponse.json(
      { error: 'WhatsApp is available on Growth and Enterprise plans only' },
      { status: 403 }
    )
  }

  try {
    // Update user's phone and opt-in status
    await sql`
      UPDATE users
      SET
        phone_number = ${clean},
        whatsapp_opted_in = TRUE,
        updated_at = NOW()
      WHERE id = ${user.id}
    `

    // Log opt-in to phone numbers table
    await sql`
      INSERT INTO user_phone_numbers (user_id, phone_number, is_primary, verified, consent_opt_in, opt_in_at)
      VALUES (${user.id}, ${clean}, TRUE, TRUE, TRUE, NOW())
      ON CONFLICT (user_id, phone_number) DO UPDATE SET
        consent_opt_in = TRUE,
        opt_in_at = NOW(),
        opt_out_at = NULL
    `

    return NextResponse.json({
      ok: true,
      message: 'Successfully opted in to WhatsApp notifications',
    })
  } catch (err) {
    console.error('[whatsapp/opt-in]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/whatsapp/opt-out
 * User opts out of WhatsApp notifications
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's phone number before opting out
    const phoneRows = await sql`
      SELECT phone_number FROM users WHERE id = ${user.id}
    `

    const phoneNumber = phoneRows.length ? (phoneRows[0] as any).phone_number : null

    // Update user's opt-in status
    await sql`
      UPDATE users
      SET
        whatsapp_opted_in = FALSE,
        updated_at = NOW()
      WHERE id = ${user.id}
    `

    // Log opt-out
    if (phoneNumber) {
      await sql`
        UPDATE user_phone_numbers
        SET
          consent_opt_in = FALSE,
          opt_out_at = NOW()
        WHERE user_id = ${user.id} AND phone_number = ${phoneNumber}
      `
    }

    return NextResponse.json({
      ok: true,
      message: 'Successfully opted out of WhatsApp notifications',
    })
  } catch (err) {
    console.error('[whatsapp/opt-out]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
