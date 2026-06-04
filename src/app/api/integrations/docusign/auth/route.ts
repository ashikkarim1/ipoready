/**
 * POST /api/integrations/docusign/auth
 * Initiates OAuth2 flow by generating authorization URL
 *
 * Body: { environment?: 'demo' | 'production' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateAuthorizationUrl } from '@/lib/integrations/docusign'
import { sql } from '@/lib/db'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { environment?: 'demo' | 'production' }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const environment = body.environment || 'demo'
  const clientId = process.env.DOCUSIGN_CLIENT_ID
  const redirectUri = process.env.DOCUSIGN_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'DocuSign not configured' },
      { status: 500 }
    )
  }

  const state = crypto.randomBytes(16).toString('hex')

  // Store state for verification
  try {
    await sql`
      INSERT INTO docusign_oauth_states (
        state,
        company_id,
        user_id,
        environment,
        expires_at,
        created_at
      ) VALUES (
        ${state},
        ${user.companyId},
        ${user.id},
        ${environment},
        NOW() + INTERVAL '10 minutes',
        NOW()
      )
    `
  } catch (err) {
    console.error('Failed to store OAuth state:', err)
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    )
  }

  const authUrl = generateAuthorizationUrl(clientId, redirectUri, environment, state)

  return NextResponse.json({ authUrl, state })
}
