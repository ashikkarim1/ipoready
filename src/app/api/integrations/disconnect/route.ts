import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import type { DisconnectIntegrationRequest } from '@/types/integrations'
import { INTEGRATION_TYPES } from '@/types/integrations'

export const dynamic = 'force-dynamic'

/**
 * Disconnect an integration for the current company
 * Removes credentials and logs disconnection event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: DisconnectIntegrationRequest = await request.json()
    const { integrationType } = body

    // Validate integration type
    if (!INTEGRATION_TYPES.includes(integrationType)) {
      return NextResponse.json(
        { error: 'Invalid integration type' },
        { status: 400 }
      )
    }

    // Find the credential to disconnect
    const credential = await sql`
      SELECT id FROM integration_credentials
      WHERE company_id = ${user.companyId}
      AND integration_type = ${integrationType}
      AND is_active = true
    `

    if (credential.length === 0) {
      return NextResponse.json(
        { error: 'Integration not connected' },
        { status: 404 }
      )
    }

    const credentialId = credential[0].id

    // Log disconnection event
    await sql`
      INSERT INTO integration_audit_log (
        credential_id, action, status
      ) VALUES (${credentialId}, 'disconnected'::integration_action, 'success'::integration_audit_status)
    `

    // Delete the credential
    await sql`
      DELETE FROM integration_credentials
      WHERE id = ${credentialId}
    `

    return NextResponse.json({
      success: true,
      message: `${integrationType} integration disconnected successfully`,
    })
  } catch (error) {
    console.error('Disconnect integration error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    )
  }
}
