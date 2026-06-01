import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface IntegrationRow {
  integration_id: string
  status: string
  connected_at: string | null
  metadata: Record<string, unknown> | null
  updated_at: string
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{  id: string  }> }
) {
  const session = await getServerSession(authOptions)
  const companyId = (session?.user as any)?.companyId

  if (!session || !companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await context.params
  const integrationId = params.id
  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status } = body
  if (status !== 'connected' && status !== 'available') {
    return NextResponse.json(
      { error: 'status must be "connected" or "available"' },
      { status: 400 }
    )
  }

  const rows = await sql`
    INSERT INTO company_integrations (company_id, integration_id, status, connected_at, updated_at)
    VALUES (
      ${companyId},
      ${integrationId},
      ${status},
      ${status === 'connected' ? sql`NOW()` : null},
      NOW()
    )
    ON CONFLICT (company_id, integration_id) DO UPDATE
      SET status       = EXCLUDED.status,
          connected_at = ${status === 'connected' ? sql`NOW()` : null},
          updated_at   = NOW()
    RETURNING integration_id, status, connected_at, metadata, updated_at
  ` as IntegrationRow[]

  const row = rows[0]
  return NextResponse.json({
    integrationId: row.integration_id,
    status: row.status,
    connectedAt: row.connected_at,
    metadata: row.metadata,
    updatedAt: row.updated_at,
  })
}
