import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { computeAndUpdateCompanyStats } from '@/lib/company-stats'

export const dynamic = 'force-dynamic'

interface CompanyRow {
  id: string
  name: string
  listing_type: string
  target_exchange: string
  current_phase: string
  pace_score: number
  estimated_days_to_ipo: number
  progress_percentage: number
  currency: string
  language: string
  created_at: string
  owner_id: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  const companyRows = await sql`
    SELECT id, name, listing_type, target_exchange, current_phase, pace_score,
           estimated_days_to_ipo, progress_percentage, currency, language, created_at, owner_id
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  ` as CompanyRow[]

  if (companyRows.length === 0) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const row = companyRows[0]

  // Compute and update stats
  const stats = await computeAndUpdateCompanyStats(companyId)

  return NextResponse.json({
    company: {
      id: row.id,
      name: row.name,
      listingType: row.listing_type,
      targetExchange: row.target_exchange,
      currentPhase: stats.currentPhase,
      paceScore: stats.paceScore,
      estimatedDaysToIpo: stats.estimatedDaysToIpo,
      progressPercentage: stats.progressPercentage,
      currency: row.currency,
      language: row.language,
      createdAt: row.created_at,
    },
  })
}

// ── PATCH — update company settings (owner only) ─────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // Verify the requester is the company owner
  const ownerRows = await sql`
    SELECT owner_id FROM companies WHERE id = ${companyId} LIMIT 1
  ` as { owner_id: string }[]

  if (ownerRows.length === 0) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  if (ownerRows[0].owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden — only the company owner can update settings' }, { status: 403 })
  }

  let body: {
    name?: string
    currentPhase?: string
    currency?: string
    language?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, currentPhase, currency, language } = body

  // Validate allowed values
  const allowedCurrencies = ['CAD', 'USD']
  const allowedLanguages = ['en', 'fr']

  if (currency && !allowedCurrencies.includes(currency)) {
    return NextResponse.json({ error: 'Invalid currency — allowed: CAD, USD' }, { status: 400 })
  }
  if (language && !allowedLanguages.includes(language)) {
    return NextResponse.json({ error: 'Invalid language — allowed: en, fr' }, { status: 400 })
  }

  // Build update — only set fields that were provided
  const updatedRows = await sql`
    UPDATE companies
    SET
      name          = COALESCE(${name ?? null}, name),
      current_phase = COALESCE(${currentPhase ?? null}, current_phase),
      currency      = COALESCE(${currency ?? null}, currency),
      language      = COALESCE(${language ?? null}, language)
    WHERE id = ${companyId}
    RETURNING id, name, current_phase, currency, language
  ` as { id: string; name: string; current_phase: string; currency: string; language: string }[]

  if (updatedRows.length === 0) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  const updated = updatedRows[0]
  return NextResponse.json({
    company: {
      id: updated.id,
      name: updated.name,
      currentPhase: updated.current_phase,
      currency: updated.currency,
      language: updated.language,
    },
  })
}
