import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface IntegrationRow {
  integration_id: string
  status: string
  connected_at: string | null
  metadata: Record<string, unknown> | null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const companyId = (session?.user as any)?.companyId

  if (!session || !companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await sql`
    SELECT integration_id, status, connected_at, metadata
    FROM company_integrations
    WHERE company_id = ${companyId}
  ` as IntegrationRow[]

  const integrations = rows.map(row => ({
    integrationId: row.integration_id,
    status: row.status,
    connectedAt: row.connected_at,
    metadata: row.metadata,
  }))

  return NextResponse.json(
    { integrations },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}
