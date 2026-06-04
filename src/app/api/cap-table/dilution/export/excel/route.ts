import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      scenario: any
      comparisonScenarios?: any[]
    }

    const { scenario, comparisonScenarios } = body

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario data required' },
        { status: 400 }
      )
    }

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Dilution Scenario Report'],
      [],
      ['Scenario Name', scenario.scenarioName],
      ['Scenario Type', scenario.scenarioType],
      ['Created Date', new Date(scenario.createdAt).toLocaleDateString()],
      [],
      ['Summary Metrics'],
      ['Current Total Shares', Number(scenario.currentSnapshot.totalShares)],
      ['Post-Dilution Total Shares', Number(scenario.postDilutionSnapshot.totalShares)],
      ['New Shares Issued', Number(scenario.postDilutionSnapshot.newSharesIssued)],
      ['Dilution Percentage %', ((Number(scenario.postDilutionSnapshot.newSharesIssued) / Number(scenario.postDilutionSnapshot.totalShares)) * 100).toFixed(2)],
      [],
      ['Assumptions'],
    ]

    // Add assumptions
    if (scenario.assumptions.warrantsExercisedPercent !== undefined) {
      summaryData.push(['Warrants Exercised (%)', scenario.assumptions.warrantsExercisedPercent])
    }
    if (scenario.assumptions.employeeOptionVestingShares) {
      summaryData.push(['Employee Options Vesting', scenario.assumptions.employeeOptionVestingShares])
    }
    if (scenario.assumptions.newFinancingAmount) {
      summaryData.push(['New Financing Amount ($)', scenario.assumptions.newFinancingAmount])
    }
    if (scenario.assumptions.projectedValuation) {
      summaryData.push(['Projected Valuation ($)', scenario.assumptions.projectedValuation])
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

    // Shareholder Impact sheet
    const impactHeaders = [
      'Shareholder',
      'Type',
      'Share Class',
      'Current Shares',
      'Current Ownership %',
      'Post-Dilution Shares',
      'Post-Dilution Ownership %',
      'Dilution %',
    ]

    const impactData = [impactHeaders]
    for (const position of scenario.shareholderImpact) {
      impactData.push([
        position.shareholderName,
        position.shareholderType,
        position.shareClass,
        Number(position.currentShares).toFixed(0),
        Number(position.currentOwnership).toFixed(2),
        Number(position.postDilutionShares).toFixed(0),
        Number(position.postDilutionOwnership).toFixed(2),
        Number(position.dilutionPercentage).toFixed(2),
      ])
    }

    const impactSheet = XLSX.utils.aoa_to_sheet(impactData)
    impactSheet['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(wb, impactSheet, 'Shareholder Impact')

    // Comparison sheet if multiple scenarios
    if (comparisonScenarios && comparisonScenarios.length > 0) {
      const comparisonHeaders = ['Shareholder', scenario.scenarioName, ...comparisonScenarios.map((s) => s.scenarioName)]
      const shareholders = new Map()

      // Build map of all shareholders across scenarios
      for (const position of scenario.shareholderImpact) {
        shareholders.set(position.shareholderId, {
          name: position.shareholderName,
          [scenario.scenarioName]: Number(position.postDilutionOwnership).toFixed(2),
        })
      }

      for (const compScenario of comparisonScenarios) {
        for (const position of compScenario.shareholderImpact) {
          const existing = shareholders.get(position.shareholderId) || {
            name: position.shareholderName,
          }
          existing[compScenario.scenarioName] = Number(position.postDilutionOwnership).toFixed(2)
          shareholders.set(position.shareholderId, existing)
        }
      }

      const comparisonData = [comparisonHeaders]
      for (const [, data] of shareholders) {
        const row = [data.name]
        row.push(data[scenario.scenarioName] || 'N/A')
        for (const compScenario of comparisonScenarios) {
          row.push(data[compScenario.scenarioName] || 'N/A')
        }
        comparisonData.push(row)
      }

      const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData)
      comparisonSheet['!cols'] = [{ wch: 25 }, ...comparisonHeaders.slice(1).map(() => ({ wch: 18 }))]
      XLSX.utils.book_append_sheet(wb, comparisonSheet, 'Scenario Comparison')
    }

    // Generate buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="dilution-scenario-${Date.now()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Excel export error:', error)
    return NextResponse.json(
      { error: 'Failed to export Excel' },
      { status: 500 }
    )
  }
}
