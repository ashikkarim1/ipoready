import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists in database
    const rows = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `

    return NextResponse.json({ exists: rows.length > 0 })
  } catch (error) {
    console.error('[POST /api/auth/check-user] Error:', error)
    // Return false on error to let normal login flow continue
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
