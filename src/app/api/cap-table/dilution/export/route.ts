import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Generate CSV content
    let csv = generateScenarioCSV(scenario)

    // Add comparison if provided
    if (comparisonScenarios && comparisonScenarios.length > 0) {
      csv += '\n\n' + generateComparisonCSV(scenario, comparisonScenarios)
    }

    // Return CSV as download
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="dilution-scenario-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    )
  }
}

function generateScenarioCSV(scenario: any): string {
  let csv = ''

  // Header section
  csv += `Dilution Scenario Report\n`
  csv += `Scenario Name,${scenario.scenarioName}\n`
  csv += `Scenario Type,${scenario.scenarioType}\n`
  csv += `Created,${new Date(scenario.createdAt).toLocaleDateString()}\n`
  csv += '\n'

  // Summary section
  csv += `Summary\n`
  csv += `Current Total Shares,${scenario.currentSnapshot.totalShares}\n`
  csv += `Post-Dilution Total Shares,${scenario.postDilutionSnapshot.totalShares}\n`
  csv += `New Shares Issued,${scenario.postDilutionSnapshot.newSharesIssued}\n`
  csv += `Dilution Percentage,${((Number(scenario.postDilutionSnapshot.newSharesIssued) / Number(scenario.postDilutionSnapshot.totalShares)) * 100).toFixed(2)}%\n`
  csv += '\n'

  // Assumptions section
  csv += `Assumptions\n`
  if (scenario.assumptions.warrantsExercisedPercent) {
    csv += `Warrants Exercised (%),${scenario.assumptions.warrantsExercisedPercent}%\n`
  }
  if (scenario.assumptions.warrantsExercisedShares) {
    csv += `Warrants Exercised (Shares),${scenario.assumptions.warrantsExercisedShares}\n`
  }
  if (scenario.assumptions.employeeOptionVestingShares) {
    csv += `Employee Option Vesting,${scenario.assumptions.employeeOptionVestingShares}\n`
  }
  if (scenario.assumptions.newFinancingAmount) {
    csv += `New Financing Amount,$${scenario.assumptions.newFinancingAmount.toLocaleString()}\n`
  }
  if (scenario.assumptions.projectedValuation) {
    csv += `Projected Valuation,$${scenario.assumptions.projectedValuation.toLocaleString()}\n`
  }
  csv += '\n'

  // Shareholder impact section
  csv += `Shareholder Impact\n`
  csv += `Shareholder,Type,Share Class,Current Shares,Current Ownership %,Post-Dilution Shares,Post-Dilution Ownership %,Dilution %\n`

  for (const position of scenario.shareholderImpact) {
    csv += `"${position.shareholderName}",${position.shareholderType},${position.shareClass},${Number(position.currentShares).toFixed(0)},${Number(position.currentOwnership).toFixed(2)},${Number(position.postDilutionShares).toFixed(0)},${Number(position.postDilutionOwnership).toFixed(2)},${Number(position.dilutionPercentage).toFixed(2)}\n`
  }

  return csv
}

function generateComparisonCSV(scenario1: any, scenario2Array: any[]): string {
  let csv = ''

  csv += `Scenario Comparison\n`
  csv += `Shareholder,${scenario1.scenarioName} Ownership %,${scenario2Array.map((s) => s.scenarioName).join(',')},\n`

  const shareholders = new Map()

  // Build map of all shareholders across scenarios
  for (const position of scenario1.shareholderImpact) {
    shareholders.set(position.shareholderId, {
      name: position.shareholderName,
      [scenario1.scenarioName]: Number(position.postDilutionOwnership).toFixed(2),
    })
  }

  for (const scenario2 of scenario2Array) {
    for (const position of scenario2.shareholderImpact) {
      const existing = shareholders.get(position.shareholderId) || {
        name: position.shareholderName,
      }
      existing[scenario2.scenarioName] = Number(
        position.postDilutionOwnership
      ).toFixed(2)
      shareholders.set(position.shareholderId, existing)
    }
  }

  // Write data rows
  for (const [, data] of shareholders) {
    let row = `"${data.name}"`
    row += `,${data[scenario1.scenarioName] || 'N/A'}`
    for (const scenario2 of scenario2Array) {
      row += `,${data[scenario2.scenarioName] || 'N/A'}`
    }
    csv += row + '\n'
  }

  return csv
}
