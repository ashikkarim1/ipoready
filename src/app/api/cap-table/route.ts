import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CapTableDocument {
  id: string
  document_name: string
  validation_status: string
  created_at: string
}

interface ShareClass {
  id: string
  class_name: string
  class_code: string
  preference_order: number
  liquidation_preference_multiplier: number | null
}

interface Shareholder {
  id: string
  shareholder_name: string
  shareholder_type: string
  entity_type: string
}

interface Holding {
  id: string
  shareholder_id: string
  share_class_id: string
  quantity: number
  quantity_issued: number
  cost_per_share: number | null
  currency: string
  grant_date: string | null
}

interface VestingSchedule {
  id: string
  holding_id: string
  vesting_start_date: string
  vesting_end_date: string
  cliff_months: number
  cliff_date: string | null
  total_vesting_months: number
  vesting_frequency: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  try {
    // 1. Get cap table documents
    const documents = await sql`
      SELECT id, document_name, validation_status, created_at
      FROM cap_table_documents
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 1
    ` as CapTableDocument[]

    if (documents.length === 0) {
      return NextResponse.json({
        documents: [],
        shareClasses: [],
        shareholders: [],
        holdings: [],
        vestingSchedules: [],
      })
    }

    const documentId = documents[0].id

    // 2. Get share classes
    const shareClasses = await sql`
      SELECT id, class_name, class_code, preference_order, liquidation_preference_multiplier
      FROM share_classes_v2
      WHERE cap_table_document_id = ${documentId}
      ORDER BY preference_order
    ` as ShareClass[]

    // 3. Get shareholders
    const shareholders = await sql`
      SELECT id, shareholder_name, shareholder_type, entity_type
      FROM shareholders
      WHERE cap_table_document_id = ${documentId}
      ORDER BY shareholder_name
    ` as Shareholder[]

    // 4. Get holdings with shareholder and share class info
    const holdingsRows = await sql`
      SELECT
        h.id,
        h.shareholder_id,
        h.share_class_id,
        h.quantity,
        h.quantity_issued,
        h.cost_per_share,
        h.currency,
        h.grant_date,
        s.shareholder_name,
        sc.class_name
      FROM holdings h
      JOIN shareholders s ON h.shareholder_id = s.id
      JOIN share_classes_v2 sc ON h.share_class_id = sc.id
      WHERE h.cap_table_document_id = ${documentId}
      ORDER BY s.shareholder_name
    ` as any[]

    const holdings = holdingsRows.map(row => ({
      id: row.id,
      shareholder_id: row.shareholder_id,
      share_class_id: row.share_class_id,
      quantity: parseFloat(row.quantity),
      quantity_issued: parseFloat(row.quantity_issued),
      cost_per_share: row.cost_per_share ? parseFloat(row.cost_per_share) : null,
      currency: row.currency,
      grant_date: row.grant_date,
      shareholder_name: row.shareholder_name,
      class_name: row.class_name,
    }))

    // 5. Get vesting schedules
    const vestingSchedules = await sql`
      SELECT
        vs.id,
        vs.holding_id,
        vs.vesting_start_date,
        vs.vesting_end_date,
        vs.cliff_months,
        vs.cliff_date,
        vs.total_vesting_months,
        vs.vesting_frequency,
        s.shareholder_name
      FROM vesting_schedules vs
      JOIN holdings h ON vs.holding_id = h.id
      JOIN shareholders s ON h.shareholder_id = s.id
      WHERE h.cap_table_document_id = ${documentId}
      ORDER BY s.shareholder_name
    ` as any[]

    return NextResponse.json({
      document: {
        id: documents[0].id,
        document_name: documents[0].document_name,
        validation_status: documents[0].validation_status,
        created_at: documents[0].created_at,
      },
      shareClasses: shareClasses.map(sc => ({
        id: sc.id,
        class_name: sc.class_name,
        class_code: sc.class_code,
        preference_order: sc.preference_order,
        liquidation_preference_multiplier: sc.liquidation_preference_multiplier,
      })),
      shareholders: shareholders.map(sh => ({
        id: sh.id,
        shareholder_name: sh.shareholder_name,
        shareholder_type: sh.shareholder_type,
        entity_type: sh.entity_type,
      })),
      holdings,
      vestingSchedules: vestingSchedules.map(vs => ({
        id: vs.id,
        holding_id: vs.holding_id,
        vesting_start_date: vs.vesting_start_date,
        vesting_end_date: vs.vesting_end_date,
        cliff_months: vs.cliff_months,
        cliff_date: vs.cliff_date,
        total_vesting_months: vs.total_vesting_months,
        vesting_frequency: vs.vesting_frequency,
        shareholder_name: vs.shareholder_name,
      })),
    })
  } catch (error) {
    console.error('Cap table API error:', error)
    return NextResponse.json({ error: 'Failed to fetch cap table data' }, { status: 500 })
  }
}
