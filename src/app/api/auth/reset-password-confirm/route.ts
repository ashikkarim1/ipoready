import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false, error: 'Missing token' }, { status: 400 })

  const rows = await sql`
    SELECT id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token = ${token}
    LIMIT 1
  `

  if (rows.length === 0) return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 400 })

  const row = rows[0] as { id: string; expires_at: string; used_at: string | null }

  if (row.used_at) return NextResponse.json({ valid: false, error: 'This link has already been used' }, { status: 400 })
  if (new Date(row.expires_at) < new Date()) return NextResponse.json({ valid: false, error: 'This link has expired. Please request a new one.' }, { status: 400 })

  return NextResponse.json({ valid: true })
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Validate token
    const rows = await sql`
      SELECT prt.id AS token_id, prt.user_id, prt.expires_at, prt.used_at
      FROM password_reset_tokens prt
      WHERE prt.token = ${token}
      LIMIT 1
    `

    if (rows.length === 0) return NextResponse.json({ error: 'Invalid or expired link. Please request a new one.' }, { status: 400 })

    const row = rows[0] as { token_id: string; user_id: string; expires_at: string; used_at: string | null }

    if (row.used_at) return NextResponse.json({ error: 'This link has already been used. Please request a new one.' }, { status: 400 })
    if (new Date(row.expires_at) < new Date()) return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 400 })

    // Update password
    const passwordHash = await bcrypt.hash(password, 12)
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${row.user_id}`

    // Mark token as used
    await sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${row.token_id}`

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password-confirm]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
