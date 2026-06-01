import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH /api/cap-table/holders/[id] — update shares, name, type, notes
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  const companyId = (session?.user as any)?.companyId
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!companyId) return NextResponse.json({ error: 'No company linked' }, { status: 400 })

  const params = await context.params
  const { name, type, shares, notes } = await req.json()

  // Verify ownership
  const existing = await sql`
    SELECT id FROM cap_table_holders WHERE id = ${params.id} AND company_id = ${companyId} LIMIT 1
  `
  if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await sql`
    UPDATE cap_table_holders
    SET
      name       = COALESCE(${name ?? null}, name),
      type       = COALESCE(${type ?? null}, type),
      shares     = COALESCE(${shares != null ? Number(shares) : null}, shares),
      notes      = ${notes !== undefined ? (notes ?? null) : sql`notes`},
      updated_at = NOW()
    WHERE id = ${params.id} AND company_id = ${companyId}
    RETURNING *
  `

  return NextResponse.json({ holder: updated[0] })
}

// DELETE /api/cap-table/holders/[id]
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  const companyId = (session?.user as any)?.companyId
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!companyId) return NextResponse.json({ error: 'No company linked' }, { status: 400 })

  const params = await context.params
  const existing = await sql`
    SELECT id FROM cap_table_holders WHERE id = ${params.id} AND company_id = ${companyId} LIMIT 1
  `
  if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql`DELETE FROM cap_table_holders WHERE id = ${params.id} AND company_id = ${companyId}`

  return NextResponse.json({ ok: true })
}
