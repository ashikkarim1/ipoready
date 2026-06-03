import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ConsentSchema = z.object({
  from_entity: z.string().min(1),
  entity_type: z.enum(['auditor', 'lawyer', 'valuation-expert', 'environmental-expert', 'other-expert']),
  consent_type: z.string().min(1),
  status: z.enum(['pending', 'received', 'rejected', 'expired', 'withdrawn']).optional(),
  document_url: z.string().url().optional(),
  expiry_date: z.string().optional(),
})

type ConsentRequest = z.infer<typeof ConsentSchema>

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = ConsentSchema.parse(body)

    const consent = await sql`
      INSERT INTO consent_letters (
        company_id, from_entity, entity_type, consent_type,
        status, document_url, expiry_date
      ) VALUES (
        ${user.companyId}, ${validatedData.from_entity},
        ${validatedData.entity_type}, ${validatedData.consent_type},
        ${validatedData.status || 'pending'}, ${validatedData.document_url || null},
        ${validatedData.expiry_date || null}
      )
      RETURNING id, from_entity, entity_type, consent_type, status, expiry_date, created_at
    ` as any[]

    if (consent.length === 0) {
      return NextResponse.json({ error: 'Failed to create consent' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      consent: {
        id: consent[0].id,
        from_entity: consent[0].from_entity,
        entity_type: consent[0].entity_type,
        consent_type: consent[0].consent_type,
        status: consent[0].status,
        expiry_date: consent[0].expiry_date,
        created_at: consent[0].created_at,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[POST /api/compliance/consents] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const consents = await sql`
      SELECT id, from_entity, entity_type, consent_type, status,
             document_url, expiry_date, created_at
      FROM consent_letters
      WHERE company_id = ${user.companyId}
      ORDER BY created_at DESC
    ` as any[]

    return NextResponse.json({
      success: true,
      consents: consents.map(c => ({
        id: c.id,
        from_entity: c.from_entity,
        entity_type: c.entity_type,
        consent_type: c.consent_type,
        status: c.status,
        document_url: c.document_url,
        expiry_date: c.expiry_date,
        created_at: c.created_at,
      })),
    })
  } catch (error) {
    console.error('[GET /api/compliance/consents] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, status, document_url } = body

    const updated = await sql`
      UPDATE consent_letters
      SET status = ${status || undefined}, document_url = ${document_url || undefined}
      WHERE id = ${id} AND company_id = ${user.companyId}
      RETURNING id, status, document_url, updated_at
    ` as any[]

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Consent not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, consent: updated[0] })
  } catch (error) {
    console.error('[PUT /api/compliance/consents] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
