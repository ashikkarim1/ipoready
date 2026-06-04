import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { DilutionScenarioEngine, CapTableSnapshot } from '@/lib/cap-table/dilution-scenarios'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = user.companyId

  try {
    // Fetch current cap table
    let capTableSnapshot = await fetchCurrentCapTable(companyId)

    // Use mock data if no cap table exists
    if (!capTableSnapshot || !capTableSnapshot.shareholders) {
      capTableSnapshot = getMockCapTable()
    }

    // Generate preset scenarios
    const presets = DilutionScenarioEngine.generatePresetScenarios(capTableSnapshot)

    // Store each scenario
    const scenarioIds = {
      base: await storeScenario(companyId, presets.base),
      optimistic: await storeScenario(companyId, presets.optimistic),
      conservative: await storeScenario(companyId, presets.conservative),
    }

    return NextResponse.json({
      base: {
        ...presets.base,
        scenarioId: scenarioIds.base,
      },
      optimistic: {
        ...presets.optimistic,
        scenarioId: scenarioIds.optimistic,
      },
      conservative: {
        ...presets.conservative,
        scenarioId: scenarioIds.conservative,
      },
    })
  } catch (error) {
    console.error('Preset scenarios error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presets' },
      { status: 500 }
    )
  }
}

async function fetchCurrentCapTable(
  companyId: string
): Promise<CapTableSnapshot | null> {
  try {
    const documents = await sql`
      SELECT id
      FROM cap_table_documents
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 1
    ` as Array<{ id: string }>

    if (documents.length === 0) {
      return null
    }

    const documentId = documents[0].id

    const holdingsData = await sql`
      SELECT
        s.id,
        s.shareholder_name,
        s.shareholder_type,
        sc.class_name,
        h.quantity,
        h.warrant_quantity,
        h.option_quantity
      FROM holdings h
      JOIN shareholders s ON h.shareholder_id = s.id
      JOIN share_classes_v2 sc ON h.share_class_id = sc.id
      WHERE h.cap_table_document_id = ${documentId}
      ORDER BY s.shareholder_name
    ` as Array<{
      id: string
      shareholder_name: string
      shareholder_type: string
      class_name: string
      quantity: string
      warrant_quantity?: string
      option_quantity?: string
    }>

    const valuationData = await sql`
      SELECT post_money_valuation
      FROM cap_table_documents
      WHERE id = ${documentId}
    ` as Array<{ post_money_valuation: string }>

    if (holdingsData.length === 0) {
      return null
    }

    const postMoneyValuation = valuationData[0]?.post_money_valuation
      ? parseFloat(valuationData[0].post_money_valuation as unknown as string)
      : 0

    return {
      shareholders: holdingsData.map((row) => ({
        id: row.id,
        name: row.shareholder_name,
        type: (row.shareholder_type as any) || 'other',
        shareClass: row.class_name,
        quantity: parseFloat(row.quantity as unknown as string),
        warrants: row.warrant_quantity
          ? parseFloat(row.warrant_quantity as unknown as string)
          : 0,
        options: row.option_quantity
          ? parseFloat(row.option_quantity as unknown as string)
          : 0,
      })),
      postMoneyValuation,
    }
  } catch (error) {
    console.error('Error fetching cap table:', error)
    return null
  }
}

async function storeScenario(companyId: string, scenario: any): Promise<string> {
  const scenarioId = `dilution-${scenario.scenarioType}-${Date.now()}`
  try {
    await sql`
      INSERT INTO dilution_scenarios (id, company_id, scenario_name, scenario_type, data, created_at)
      VALUES (${scenarioId}, ${companyId}, ${scenario.scenarioName}, ${scenario.scenarioType}, ${JSON.stringify(scenario)}, NOW())
    `
  } catch (error) {
    console.error('Error storing scenario:', error)
  }
  return scenarioId
}

function getMockCapTable(): CapTableSnapshot {
  return {
    shareholders: [
      {
        id: 'founder-1',
        name: 'Founder & CEO',
        type: 'founder',
        shareClass: 'Common',
        quantity: 3000000,
        warrants: 0,
        options: 0,
      },
      {
        id: 'founder-2',
        name: 'Co-Founder & CTO',
        type: 'founder',
        shareClass: 'Common',
        quantity: 1500000,
        warrants: 0,
        options: 0,
      },
      {
        id: 'investor-1',
        name: 'Series A Investor',
        type: 'investor',
        shareClass: 'Preferred A',
        quantity: 2000000,
        warrants: 200000,
        options: 0,
      },
      {
        id: 'investor-2',
        name: 'Series B Investor',
        type: 'investor',
        shareClass: 'Preferred B',
        quantity: 1500000,
        warrants: 150000,
        options: 0,
      },
      {
        id: 'employee-pool',
        name: 'Employee Option Pool',
        type: 'employee',
        shareClass: 'Common',
        quantity: 500000,
        warrants: 0,
        options: 500000,
      },
    ],
    postMoneyValuation: 50000000,
  }
}
