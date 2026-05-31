import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CompanyRow {
  id: string
  listing_type: string | null
  target_exchange: string | null
}

interface CountRow {
  count: string
}

// Standard IPO document checklist
const STANDARD_DOCS = [
  {
    name: 'Personal Information Form (PIF) — Director 1',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: true,
    next_step: 'Forward blank PIF form to Director 1 — must be signed and returned within 5 business days',
  },
  {
    name: 'Personal Information Form (PIF) — Director 2',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: true,
    next_step: 'Forward blank PIF form to Director 2 — must be signed and returned within 5 business days',
  },
  {
    name: 'Personal Information Form (PIF) — Director 3',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: true,
    next_step: 'Forward blank PIF form to Director 3 — must be signed and returned within 5 business days',
  },
  {
    name: 'Articles of Incorporation (amended)',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: false,
    next_step: 'Obtain certified copy from registrar — must reflect final pre-IPO corporate structure',
  },
  {
    name: 'Shareholders Agreement',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: false,
    next_step: 'Review with legal counsel — ensure drag-along, tag-along, and pre-emptive rights are current',
  },
  {
    name: 'Board Resolutions (IPO Authorization)',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: false,
    next_step: 'Prepare board resolution authorizing IPO process — legal counsel to draft and board to approve',
  },
  {
    name: 'Corporate Governance Manual',
    type: 'Legal',
    phase: 'Corporate Restructuring',
    for_filing: true,
    next_step: 'Draft with legal counsel → includes Audit Committee Charter, Code of Conduct, Insider Trading Policy, Disclosure Policy',
  },
  {
    name: 'Audited Financial Statements (Year 1)',
    type: 'Financial',
    phase: 'Financial Audit',
    for_filing: true,
    next_step: 'Auditors complete fieldwork → management sign-off → auditor sign-off → file on SEDAR',
  },
  {
    name: 'Audited Financial Statements (Year 2)',
    type: 'Financial',
    phase: 'Financial Audit',
    for_filing: true,
    next_step: 'Auditors complete fieldwork → management sign-off → auditor sign-off → file on SEDAR',
  },
  {
    name: 'Interim Financial Statements',
    type: 'Financial',
    phase: 'Financial Audit',
    for_filing: true,
    next_step: 'Prepare most recent interim period → reviewed by auditors → filed alongside prospectus',
  },
  {
    name: 'Management Discussion & Analysis (MD&A)',
    type: 'Financial',
    phase: 'Financial Audit',
    for_filing: true,
    next_step: 'Draft internally → reviewed by auditor and legal counsel → file alongside financial statements',
  },
  {
    name: 'Engagement Letter — Legal Counsel',
    type: 'Legal',
    phase: 'Legal Documentation',
    for_filing: false,
    next_step: 'Execute engagement letter with IPO legal counsel before commencing prospectus work',
  },
  {
    name: 'Engagement Letter — Auditors',
    type: 'Legal',
    phase: 'Legal Documentation',
    for_filing: false,
    next_step: 'Execute audit engagement letter — confirm scope includes two-year audit required for prospectus',
  },
  {
    name: 'Prospectus Draft',
    type: 'Regulatory',
    phase: 'Legal Documentation',
    for_filing: true,
    next_step: 'Draft with legal counsel → board approval required → file with securities regulator → public comment period begins',
  },
  {
    name: 'Underwriting Agreement',
    type: 'Legal',
    phase: 'Legal Documentation',
    for_filing: false,
    next_step: 'Negotiate with lead underwriter → execute at time of final prospectus filing',
  },
  {
    name: 'Lock-up Agreements',
    type: 'Legal',
    phase: 'Legal Documentation',
    for_filing: true,
    next_step: 'Collect signed lock-up agreements from all insiders before exchange listing application',
  },
  {
    name: 'Transfer Agent Agreement',
    type: 'Legal',
    phase: 'Legal Documentation',
    for_filing: false,
    next_step: 'Execute agreement with registrar → provide certified copy to exchange in listing application package',
  },
]

// NI 43-101 Technical Report — mining only
const MINING_DOCS = [
  {
    name: 'NI 43-101 Technical Report',
    type: 'Regulatory',
    phase: 'Legal Documentation',
    for_filing: true,
    next_step: 'Retain qualified person (QP) → complete site visit and report → file on SEDAR with prospectus',
  },
]

export async function POST() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  // Check if docs already exist
  const countRows = await sql`
    SELECT COUNT(*) AS count FROM documents WHERE company_id = ${companyId}
  ` as CountRow[]

  const existingCount = parseInt(countRows[0]?.count ?? '0', 10)
  if (existingCount > 0) {
    return NextResponse.json({ alreadySeeded: true, count: existingCount })
  }

  // Get company details to determine if mining
  const companyRows = await sql`
    SELECT id, listing_type, target_exchange
    FROM companies
    WHERE id = ${companyId}
    LIMIT 1
  ` as CompanyRow[]

  const company = companyRows[0] as CompanyRow | undefined
  const listingType = company?.listing_type?.toLowerCase() ?? ''
  const isMining = listingType.includes('mining') || listingType.includes('mineral') || listingType.includes('resource')

  const docsToSeed = [...STANDARD_DOCS, ...(isMining ? MINING_DOCS : [])]

  for (const doc of docsToSeed) {
    await sql`
      INSERT INTO documents (
        company_id,
        name,
        type,
        phase,
        status,
        required,
        for_filing,
        next_step
      ) VALUES (
        ${companyId},
        ${doc.name},
        ${doc.type},
        ${doc.phase},
        'pending',
        TRUE,
        ${doc.for_filing},
        ${doc.next_step}
      )
    `
  }

  return NextResponse.json({ seeded: docsToSeed.length })
}
