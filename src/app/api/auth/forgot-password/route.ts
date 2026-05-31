import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { APP_URL } from '@/lib/resend'
import { sendPasswordResetEmail } from '@/lib/email-service'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalised = email.toLowerCase().trim()

    // Look up user — always return 200 to avoid email enumeration
    const rows = await sql`
      SELECT id, name FROM users WHERE email = ${normalised} LIMIT 1
    `

    if (rows.length > 0) {
      const user = rows[0] as { id: string; name: string }

      // Invalidate any existing unused tokens for this user
      await sql`
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ${user.id} AND used_at IS NULL
      `

      // Create new token (hex, 48 chars = 24 random bytes)
      const token = randomBytes(24).toString('hex')

      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, NOW() + INTERVAL '1 hour')
      `

      const resetUrl = `${APP_URL}/reset-password?token=${token}`

      await sendPasswordResetEmail(user.id, {
        name: user.name,
        email: normalised,
        resetUrl,
        expiresInMinutes: 60,
      })
    }

    // Always return the same response — prevents email enumeration
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
