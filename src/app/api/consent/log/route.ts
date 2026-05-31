/**
 * Cookie Consent Logging Endpoint
 * Logs explicit user consent for GDPR/PIPEDA compliance
 *
 * POST /api/consent/log
 * Body: { action: 'accept_all' | 'reject_all' | 'custom_preferences', preferences: {...} }
 */

import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { action, preferences } = await req.json()

    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || null

    if (!action || !preferences) {
      return NextResponse.json(
        { error: 'Missing action or preferences' },
        { status: 400 }
      )
    }

    // Log consent to database
    await sql`
      INSERT INTO consent_records (
        user_id,
        consent_type,
        consent_given,
        version,
        ip_address,
        user_agent,
        recorded_at
      ) VALUES (
        ${userId},
        'cookies',
        ${action !== 'reject_all'},
        '1.0',
        ${req.headers.get('x-forwarded-for') || 'unknown'},
        ${req.headers.get('user-agent') || 'unknown'},
        NOW()
      )
    `

    // Also log the specific preferences
    if (preferences.analytics) {
      await sql`
        INSERT INTO consent_records (user_id, consent_type, consent_given, version, ip_address, user_agent)
        VALUES (${userId}, 'analytics', true, '1.0', ${req.headers.get('x-forwarded-for')}, ${req.headers.get('user-agent')})
      `
    }

    if (preferences.marketing) {
      await sql`
        INSERT INTO consent_records (user_id, consent_type, consent_given, version, ip_address, user_agent)
        VALUES (${userId}, 'marketing', true, '1.0', ${req.headers.get('x-forwarded-for')}, ${req.headers.get('user-agent')})
      `
    }

    if (preferences.preferences) {
      await sql`
        INSERT INTO consent_records (user_id, consent_type, consent_given, version, ip_address, user_agent)
        VALUES (${userId}, 'preferences', true, '1.0', ${req.headers.get('x-forwarded-for')}, ${req.headers.get('user-agent')})
      `
    }

    // Log in audit trail
    if (userId) {
      await sql`
        INSERT INTO audit_logs (user_id, action, details, ip_address)
        VALUES (
          ${userId},
          'cookie_consent_' || ${action},
          ${JSON.stringify(preferences)},
          ${req.headers.get('x-forwarded-for') || 'unknown'}
        )
      `
    }

    return NextResponse.json(
      { success: true, message: 'Consent logged' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error logging consent:', error)
    return NextResponse.json(
      { error: 'Failed to log consent' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to retrieve user's cookie preferences
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const consents = await sql`
      SELECT consent_type, consent_given, recorded_at
      FROM consent_records
      WHERE user_id = ${session.user.id}
      ORDER BY recorded_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      preferences: consents,
      message: 'User consent history retrieved',
    })
  } catch (error) {
    console.error('Error retrieving consent:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve consent' },
      { status: 500 }
    )
  }
}
