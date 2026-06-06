/**
 * Data Export Endpoint (GDPR Article 15 / PIPEDA Right to Access)
 * Allows users to export their personal data in machine-readable format
 *
 * POST /api/user/data-export
 * Body: { password: string } // Require password for security
 * Returns: JSON file with all user data
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { compare } from 'bcryptjs'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to export data.' },
        { status: 401 }
      )
    }

    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password required for security verification' },
        { status: 400 }
      )
    }

    // Fetch user account and verify password
    const user = (await sql`
      SELECT id, password_hash, email, name
      FROM users
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

    // Collect all user data
    const userData = {
      export_timestamp: new Date().toISOString(),
      export_version: '1.0',
      jurisdiction_compliance: ['GDPR', 'PIPEDA', 'CCPA'],
      user_info: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      data: {},
    } as any

    // User companies
    const companies = await sql`
      SELECT * FROM companies WHERE created_by = ${user.id}
    `
    userData.data.companies = companies

    // User team memberships
    const teamMemberships = await sql`
      SELECT * FROM team_members WHERE user_id = ${user.id}
    `
    userData.data.team_memberships = teamMemberships

    // User documents
    const documents = await sql`
      SELECT * FROM documents WHERE user_id = ${user.id}
    `
    userData.data.documents = documents.map((doc: any) => ({
      ...doc,
      file_data_redacted: true, // Don't include actual file binary
      note: 'Binary file data excluded; files available via app interface',
    }))

    // User tasks/checklist items
    const tasks = await sql`
      SELECT * FROM tasks WHERE company_id IN (
        SELECT id FROM companies WHERE created_by = ${user.id}
      )
    `
    userData.data.tasks = tasks

    // User integrations
    const integrations = await sql`
      SELECT id, type, status, created_at FROM integrations WHERE user_id = ${user.id}
    `
    // Redact sensitive tokens
    userData.data.integrations = integrations.map((int: any) => ({
      ...int,
      access_token_redacted: true,
      refresh_token_redacted: true,
    }))

    // PACE scores
    const paceScores = await sql`
      SELECT * FROM pace_scores WHERE company_id IN (
        SELECT id FROM companies WHERE created_by = ${user.id}
      )
    `
    userData.data.pace_scores = paceScores

    // Document scorecards
    const documentScores = await sql`
      SELECT * FROM document_scorecards WHERE company_id IN (
        SELECT id FROM companies WHERE created_by = ${user.id}
      )
    `
    userData.data.document_scorecards = documentScores

    // Audit log
    const auditLog = await sql`
      SELECT * FROM audit_logs WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1000
    `
    userData.data.audit_log = auditLog

    // Payment history
    const payments = await sql`
      SELECT id, amount, currency, status, created_at FROM payment_history
      WHERE company_id IN (SELECT id FROM companies WHERE created_by = ${user.id})
    `
    userData.data.payment_history = payments

    // Generate JSON export
    const jsonData = JSON.stringify(userData, null, 2)

    // Log the data export request for compliance
    await sql`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (
        ${user.id},
        'data_export_requested',
        ${'User requested personal data export'},
        ${req.headers.get('x-forwarded-for') || 'unknown'}
      )
    `

    // Return as downloadable JSON file
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="ipoready-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data. Please try again or contact support.' },
      { status: 500 }
    )
  }
}
