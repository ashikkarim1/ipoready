import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export interface SyndicationTemplate {
  id: string
  title: string
  type: 'lead-underwriter' | 'co-underwriter' | 'standstill'
  description: string
  keyTerms: string[]
  exchanges: string[]
  lastUpdated: string
  fileFormat: 'docx'
}

// Core 3 template library (MVP - not database-backed)
// These are the primary syndication agreement templates for IPO/RTO transactions
const SYNDICATION_TEMPLATES: SyndicationTemplate[] = [
  {
    id: 'template-001',
    title: 'Lead Underwriter Agreement',
    type: 'lead-underwriter',
    description:
      'Master agreement between issuer and lead underwriter defining roles, responsibilities, and compensation structure. The lead underwriter commits to purchase or find purchasers for the entire offering and manages all underwriting syndicate activities.',
    keyTerms: [
      'Commitment: Lead underwriter commits to purchase or find purchasers for entire offering',
      'Compensation: Underwriting discount typically 3-7% of offering proceeds',
      'Due diligence: Lead underwriter conducts full legal and financial diligence',
      'Stabilization: Lead underwriter may stabilize stock price post-IPO for up to 30 days',
      'Lock-up agreement: Typically 180 days post-closing with limited exceptions',
      'Expenses: Issuer covers reasonable out-of-pocket expenses of underwriting syndicate',
      'Representations and warranties: Standard corporate reps regarding financial statements and operations',
    ],
    exchanges: ['NYSE', 'NASDAQ', 'TSX'],
    lastUpdated: '2026-01-15',
    fileFormat: 'docx',
  },
  {
    id: 'template-002',
    title: 'Co-Underwriter Agreement',
    type: 'co-underwriter',
    description:
      'Agreement with secondary underwriters who support the lead underwriter in distributing securities. Co-underwriters commit to specific share allocations and share in commissions and expenses based on syndicate position.',
    keyTerms: [
      'Syndicate participation: Co-underwriters commit to specific share allocations within offering',
      'Compensation: Underwriting discounts and selling concessions shared with lead underwriter',
      'Sales commitment: Minimum sales target obligations per co-underwriter',
      'Standstill obligations: Restricted from trading or transferring allocated shares during lock-up',
      'Indemnification: Mutual indemnification for misrepresentations and omissions',
      'Expenses: Shared responsibility for underwriting expenses based on syndicate position',
      'Managing underwriter authority: Co-underwriters authorize lead to take syndicate actions',
    ],
    exchanges: ['NYSE', 'NASDAQ', 'TSX', 'Euronext'],
    lastUpdated: '2026-01-15',
    fileFormat: 'docx',
  },
  {
    id: 'template-003',
    title: 'Standstill Agreement',
    type: 'standstill',
    description:
      'Restricts insiders and underwriting syndicate members from selling their shares during the lock-up period and post-IPO trading. Prevents market flooding and provides price stability.',
    keyTerms: [
      'Lock-up period: Typically 180 days from IPO closing (extendable to 270 days)',
      'Scope of restriction: Applies to founders, executives, directors, and underwriters',
      'Exemptions: Limited sales allowed for death, hardship, or estate requirements',
      'Penalties: Breach may trigger forced return of shares or financial penalties',
      'Rule 10b5-1 trading plans: Permits pre-arranged trading plans to begin post-lock-up',
      'Extension rights: Underwriter may extend lock-up under specific market conditions',
      'Public announcement: Any extension must be publicly announced per exchange rules',
    ],
    exchanges: ['NYSE', 'NASDAQ', 'TSX', 'TSXV'],
    lastUpdated: '2026-01-15',
    fileFormat: 'docx',
  },
]

export interface TemplatesResponse {
  success: boolean
  data: SyndicationTemplate[]
  total: number
}

/**
 * GET /api/compliance/templates
 * Fetch list of all available syndication templates
 * Requires authentication via NextAuth
 *
 * Query params:
 * - type (optional): lead-underwriter|co-underwriter|standstill
 * - exchange (optional): NYSE|NASDAQ|TSX|TSXV|Euronext
 *
 * Response: Array of 3 core syndication templates with full metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse<TemplatesResponse>> {
  const session = await getServerSession(authOptions)

  // Require authentication
  if (!session) {
    return NextResponse.json({ success: false, data: [], total: 0 }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const typeFilter = searchParams.get('type')
    const exchangeFilter = searchParams.get('exchange')

    let filtered = SYNDICATION_TEMPLATES

    // Filter by template type if provided
    if (typeFilter) {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // Filter by exchange if provided
    if (exchangeFilter) {
      filtered = filtered.filter((t) => t.exchanges.includes(exchangeFilter))
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
    })
  } catch (error) {
    console.error('[GET /api/compliance/templates] Error:', error)
    return NextResponse.json(
      { success: false, data: [], total: 0 },
      { status: 500 }
    )
  }
}
