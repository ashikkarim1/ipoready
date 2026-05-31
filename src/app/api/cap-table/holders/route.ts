import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/cap-table/holders — fetch all holders for this user's company
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  const companyId = (session?.user as any)?.companyId
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!companyId) return NextResponse.json({ holders: [] })

  const holders = await sql`
    SELECT * FROM cap_table_holders
    WHERE company_id = ${companyId}
    ORDER BY sort_order ASC, created_at ASC
  `

  return NextResponse.json({ holders })
}

// POST /api/cap-table/holders — add a new holder
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  const companyId = (session?.user as any)?.companyId
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!companyId) return NextResponse.json({ error: 'No company linked' }, { status: 400 })

  const { name, type, shares, notes } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (shares == null || isNaN(Number(shares))) return NextResponse.json({ error: 'Shares must be a number' }, { status: 400 })

  // Assign sort_order as next in sequence
  const countRow = await sql`SELECT COUNT(*) AS cnt FROM cap_table_holders WHERE company_id = ${companyId}`
  const sortOrder = parseInt((countRow[0] as any).cnt ?? '0')

  const inserted = await sql`
    INSERT INTO cap_table_holders (company_id, name, type, shares, notes, sort_order, created_at, updated_at)
    VALUES (${companyId}, ${name.trim()}, ${type ?? 'investor'}, ${Number(shares)}, ${notes ?? null}, ${sortOrder}, NOW(), NOW())
    RETURNING *
  `

  return NextResponse.json({ holder: inserted[0] })
}
