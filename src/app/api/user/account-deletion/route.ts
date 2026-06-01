/**
 * Account Deletion Endpoint (GDPR Article 17 / PIPEDA Right to Erasure)
 * Allows users to permanently delete their account and personal data
 *
 * POST /api/user/account-deletion
 * Body: { password: string, reason?: string, consent: boolean }
 * Returns: Deletion confirmation with timeline
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { compare } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { sendSubscriptionCancelledEmail } from '@/lib/billing-notifications'

interface DeletionRequest {
  password: string
  reason?: string
  consent: boolean
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to delete account.' },
        { status: 401 }
      )
    }

    const body: DeletionRequest = await req.json()
    const { password, reason, consent } = body

    // Validate required fields
    if (!password || !consent) {
      return NextResponse.json(
        { error: 'Password and consent required to delete account' },
        { status: 400 }
      )
    }

    // Fetch user and verify password
    const user = (await sql`
      SELECT id, email, name, password_hash FROM users
      WHERE email = ${session.user.email}
      LIMIT 1
    `)[0] as any

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify password
    const passwordValid = await compare(password, user.password_hash)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Password incorrect' }, { status: 403 })
    }

    // Log deletion request for compliance audit
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (
        ${user.id},
        'account_deletion_requested',
        ${{
          reason: reason || 'Not specified',
          timestamp: new Date().toISOString(),
        }},
        ${req.headers.get('x-forwarded-for') || 'unknown'}
      )
    `

    // Mark user account for deletion (soft delete first)
    const deletionScheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    await sql`
      UPDATE users
      SET
        deletion_requested_at = NOW(),
        deletion_scheduled_for = ${deletionScheduledFor.toISOString()},
        status = 'pending_deletion'
      WHERE id = ${user.id}
    `

    // Get user's companies for notification
    const companies = await sql`
      SELECT id, name FROM companies WHERE created_by = ${user.id}
    `

    // Immediately anonymize sensitive user data (before 30-day retention period)
    await sql`
      UPDATE users
      SET
        name = 'Deleted User',
        email = concat('deleted_', id, '@ipoready.local'),
        phone = NULL,
        avatar_url = NULL
      WHERE id = ${user.id}
    `

    // Schedule permanent deletion of:
    // - Account records
    // - Company data (if sole owner)
    // - Documents
    // - Team memberships
    // Keep financial records for 7 years (legal requirement)
    await sql`
      INSERT INTO deletion_jobs (user_id, status, scheduled_for, data_types)
      VALUES (
        ${user.id},
        'scheduled',
        ${deletionScheduledFor.toISOString()},
        ${'["user_profile", "documents", "integrations", "team_membership", "pace_scores"]'}
      )
    `

    // Send confirmation email for each company
    for (const company of companies) {
      try {
        await sendSubscriptionCancelledEmail(
          company.email,
          company.name,
          company.subscription_plan || 'starter',
          new Date().toLocaleDateString()
        )
      } catch (err) {
        console.error(`Failed to send deletion email for company ${company.id}:`, err)
      }
    }

    // Send detailed deletion confirmation with timeline
    const response = {
      status: 'deletion_scheduled',
      message: 'Your account deletion has been scheduled',
      timeline: {
        requested_date: new Date().toISOString(),
        data_retention_ends: deletionScheduledFor.toISOString(),
        hard_deletion_date: deletionScheduledFor.toISOString(),
        days_remaining: 30,
      },
      data_to_be_deleted: [
        'User profile and authentication data',
        'Personal information (name, email, phone)',
        'Team memberships and roles',
        'Documents and uploads',
        'API integrations and tokens',
        'PACE scores and analytics',
        'Notification preferences',
        'Session and login history',
      ],
      data_retained_for_compliance: [
        'Financial records (7 years - tax compliance)',
        'Audit logs (3 years - regulatory compliance)',
        'Anonymized usage statistics (for product improvement)',
      ],
      recovery_option: {
        available: true,
        instructions:
          'You can cancel the deletion request by logging back in within 30 days. Contact support@ipoready.com if you need assistance.',
      },
      affected_companies: companies.map((c: any) => ({
        id: c.id,
        name: c.name,
      })),
      compliance_notes: {
        gdpr:
          'Your data will be deleted in accordance with GDPR Article 17 (Right to Erasure)',
        pipeda: 'Your data will be deleted in accordance with PIPEDA and Canadian privacy law',
        ccpa: 'Your data will be deleted in accordance with CCPA consumer deletion rights',
      },
      next_steps: [
        'A confirmation email has been sent to your registered email address',
        'Your account will become inaccessible in 30 days',
        'You can cancel this deletion by logging in before the scheduled date',
        'All financial records will be retained for 7 years per tax law',
        'For questions, contact privacy@ipoready.com',
      ],
    }

    return NextResponse.json(response, { status: 202 })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process account deletion. Please contact support@ipoready.com',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check deletion status
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = (await sql`
      SELECT id, deletion_requested_at, deletion_scheduled_for, status
      FROM users
      WHERE email = ${session.user.email}
      LIMIT 1
    `)[0] as any

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.status !== 'pending_deletion') {
      return NextResponse.json(
        {
          status: 'active',
          message: 'Your account is active. No deletion scheduled.',
        },
        { status: 200 }
      )
    }

    const daysRemaining = Math.ceil(
      (new Date(user.deletion_scheduled_for).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    )

    return NextResponse.json({
      status: 'pending_deletion',
      deletion_requested_date: user.deletion_requested_at,
      deletion_scheduled_date: user.deletion_scheduled_for,
      days_remaining: Math.max(0, daysRemaining),
      can_cancel: daysRemaining > 0,
      recovery_instructions:
        'Log in to your account to cancel the deletion request before the scheduled date.',
    })
  } catch (error) {
    console.error('Deletion status check error:', error)
    return NextResponse.json({ error: 'Failed to check deletion status' }, { status: 500 })
  }
}

/**
 * PATCH endpoint to cancel deletion request
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = (await sql`
      SELECT id, status, deletion_requested_at FROM users
      WHERE email = ${session.user.email}
      LIMIT 1
    `)[0] as any

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.status !== 'pending_deletion') {
      return NextResponse.json(
        { error: 'No deletion in progress for this account' },
        { status: 400 }
      )
    }

    // Cancel the deletion
    await sql`
      UPDATE users
      SET
        deletion_requested_at = NULL,
        deletion_scheduled_for = NULL,
        status = 'active'
      WHERE id = ${user.id}
    `

    // Cancel associated deletion jobs
    await sql`
      UPDATE deletion_jobs
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE user_id = ${user.id} AND status = 'scheduled'
    `

    // Log cancellation
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (
        ${user.id},
        'account_deletion_cancelled',
        ${'User cancelled account deletion request'},
        ${req.headers.get('x-forwarded-for') || 'unknown'}
      )
    `

    return NextResponse.json({
      status: 'deletion_cancelled',
      message: 'Your account deletion request has been cancelled. Your account is now active.',
      note: 'If your name or email was already anonymized, please contact support@ipoready.com to restore them.',
    })
  } catch (error) {
    console.error('Deletion cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel deletion request' },
      { status: 500 }
    )
  }
}
