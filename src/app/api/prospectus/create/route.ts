import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { initializeProspectus } from '@/lib/prospectus-engine'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  companyId: z.string().uuid(),
  exchangeId: z.string(),
})

/**
 * POST /api/prospectus/create
 * Initialize a new prospectus for a company
 * Body: { companyId, exchangeId }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof BodySchema>

  try {
    const json = await req.json()
    body = BodySchema.parse(json)
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { companyId, exchangeId } = body

  try {
    // Verify company exists and user has access
    const companyRows = await sql`
      SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1
    ` as any[]

    if (companyRows.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Initialize prospectus using engine
    const prospectusProgress = await initializeProspectus(companyId, exchangeId)

    return NextResponse.json({
      success: true,
      prospectus: prospectusProgress,
    })
  } catch (error) {
    console.error('[POST /api/prospectus/create] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create prospectus', details: (error as any).message },
      { status: 500 }
    )
  }
}
