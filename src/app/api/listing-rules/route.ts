/**
 * API Route for Listing Rules Engine
 * POST /api/listing-rules - Generate listing report
 * GET /api/listing-rules?exchange=tsx - Get exchange config
 * GET /api/listing-rules/compare?exchanges=tsx,nasdaq - Compare exchanges
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateListingReport,
  compareExchangeReadiness,
  CapTableData,
} from '@/lib/listing-rules'
import { ExchangeCode, getExchangeConfig, compareExchanges } from '@/lib/exchange-config'

// ============================================================================
// POST Handler - Generate Listing Report
// ============================================================================

/**
 * POST /api/listing-rules
 * Generate a listing compliance report for a company
 *
 * Request body:
 * {
 *   exchange: 'tsx' | 'tsxv' | 'nasdaq' | 'nyse' | 'cse',
 *   capTable: CapTableData
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exchange, capTable } = body

    // Validate required fields
    if (!exchange) {
      return NextResponse.json(
        { error: 'exchange parameter is required' },
        { status: 400 }
      )
    }

    if (!capTable) {
      return NextResponse.json(
        { error: 'capTable object is required' },
        { status: 400 }
      )
    }

    // Validate exchange code
    const validExchanges = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']
    if (!validExchanges.includes(exchange)) {
      return NextResponse.json(
        { error: `Invalid exchange. Must be one of: ${validExchanges.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate report
    const report = generateListingReport(exchange as ExchangeCode, capTable as CapTableData)

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    console.error('Error generating listing report:', error)
    return NextResponse.json(
      { error: 'Failed to generate listing report' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET Handler - Get Exchange Config or Compare Exchanges
// ============================================================================

/**
 * GET /api/listing-rules?exchange=tsx
 * Get configuration for a specific exchange
 *
 * GET /api/listing-rules?compare=tsx,nasdaq
 * Compare two or more exchanges
 *
 * GET /api/listing-rules?compareWith=tsx,nasdaq&capTable={...}
 * Compare exchanges against cap table data
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    // Case 1: Get single exchange config
    const exchange = searchParams.get('exchange')
    if (exchange) {
      const validExchanges = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']
      if (!validExchanges.includes(exchange)) {
        return NextResponse.json(
          { error: `Invalid exchange. Must be one of: ${validExchanges.join(', ')}` },
          { status: 400 }
        )
      }

      const config = getExchangeConfig(exchange as ExchangeCode)
      return NextResponse.json(config, { status: 200 })
    }

    // Case 2: Compare two exchanges (structure only)
    const compareParam = searchParams.get('compare')
    if (compareParam) {
      const exchanges = compareParam.split(',').map((e) => e.trim())

      if (exchanges.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 exchanges required for comparison' },
          { status: 400 }
        )
      }

      if (exchanges.length > 5) {
        return NextResponse.json(
          { error: 'Maximum 5 exchanges can be compared' },
          { status: 400 }
        )
      }

      // Validate all exchanges
      const validExchanges = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']
      for (const ex of exchanges) {
        if (!validExchanges.includes(ex)) {
          return NextResponse.json(
            { error: `Invalid exchange: ${ex}` },
            { status: 400 }
          )
        }
      }

      // Build comparison data
      const comparisonData = exchanges.map((ex) => ({
        exchange: ex,
        config: getExchangeConfig(ex as ExchangeCode),
      }))

      return NextResponse.json(
        {
          exchanges: comparisonData,
          comparison: compareExchanges(
            exchanges[0] as ExchangeCode,
            exchanges[1] as ExchangeCode
          ),
        },
        { status: 200 }
      )
    }

    // Case 3: Compare exchanges against cap table
    const compareWithParam = searchParams.get('compareWith')
    if (compareWithParam) {
      const exchanges = compareWithParam.split(',').map((e) => e.trim())
      const capTableParam = searchParams.get('capTable')

      if (!capTableParam) {
        return NextResponse.json(
          { error: 'capTable parameter required for comparison' },
          { status: 400 }
        )
      }

      let capTable: CapTableData
      try {
        capTable = JSON.parse(decodeURIComponent(capTableParam))
      } catch {
        return NextResponse.json(
          { error: 'Invalid capTable JSON' },
          { status: 400 }
        )
      }

      const reports = compareExchangeReadiness(exchanges as ExchangeCode[], capTable)

      return NextResponse.json(
        {
          companyName: capTable.companyName,
          exchanges,
          reports,
        },
        { status: 200 }
      )
    }

    // Default: List all available exchanges
    const allExchanges = ['tsx', 'tsxv', 'nasdaq', 'nyse', 'cse']
    const configs = allExchanges.map((ex) => ({
      code: ex,
      config: getExchangeConfig(ex as ExchangeCode),
    }))

    return NextResponse.json(
      {
        message: 'Use ?exchange=CODE for single exchange, ?compare=CODE1,CODE2 for comparison',
        availableExchanges: allExchanges,
        exchanges: configs,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing listing rules request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// ============================================================================
// OPTIONS Handler - CORS support
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
