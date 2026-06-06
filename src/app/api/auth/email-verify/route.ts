import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const users = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = (users[0] as { id: string }).id

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store token
    await sql`
      INSERT INTO email_verification_tokens (user_id, token, email_to, expires_at)
      VALUES (${userId}, ${token}, ${email}, ${expiresAt.toISOString()})
    `

    // Return verification link (client should send email)
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`

    return NextResponse.json({
      success: true,
      verificationLink,
      expiresAt: expiresAt.toISOString(),
      message: 'Verification token generated. Email this link to the user.',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to generate verification token' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find and validate token
    const tokens = await sql`
      SELECT user_id, email_to, expires_at, verified_at
      FROM email_verification_tokens
      WHERE token = ${token}
      LIMIT 1
    `

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      )
    }

    const tokenData = tokens[0] as {
      user_id: string
      email_to: string
      expires_at: string
      verified_at: string | null
    }

    // Check if already verified
    if (tokenData.verified_at) {
      return NextResponse.json({
        error: 'Email already verified',
        verified: true,
      })
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }

    // Mark as verified
    await sql`
      UPDATE email_verification_tokens
      SET verified_at = NOW()
      WHERE token = ${token}
    `

    // Update user email_verified flag (if exists in schema)
    await sql`
      UPDATE users
      SET email_verified = true
      WHERE id = ${tokenData.user_id}
    `.catch(() => {
      // Column might not exist yet, that's ok
    })

    // Log verification
    console.log(
      `✅ Email verified for user ${tokenData.user_id} (${tokenData.email_to})`
    )

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email verified successfully',
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
