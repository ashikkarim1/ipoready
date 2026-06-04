/**
 * API Routes for Exchange-Agnostic Regulatory Rules Engine
 *
 * GET  /api/regulatory                          - List all configured exchanges
 * GET  /api/regulatory/exchanges/{code}         - Get exchange configuration
 * GET  /api/regulatory/exchanges/{code}/requirements - Get requirements for exchange
 * GET  /api/regulatory/exchanges/{code}/checklist  - Get filing checklist
 * POST /api/regulatory/validate                 - Validate filing against rules
 * GET  /api/regulatory/compare                  - Compare exchanges
 * POST /api/regulatory/{exchange}/validate-section - Validate prospectus section
 * GET  /api/regulatory/{exchange}/guidance      - Get guidance for section
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  ValidateFilingRequest,
  ValidateFilingResponse,
  GetChecklistRequest,
  ValidateSectionRequest,
} from '@/types/regulatory-rules-engine'
import { RegulatoryRulesEngine } from '@/lib/regulatory-rules-engine'
import TSXConfig from '@/config/regulatory-exchanges/tsx-config.json'
import SECConfig from '@/config/regulatory-exchanges/sec-edgar-config.json'

// ============================================================================
// INITIALIZATION - Load exchange configurations
// ============================================================================

let rulesEngine: RegulatoryRulesEngine | null = null

async function initializeEngine(): Promise<RegulatoryRulesEngine> {
  if (rulesEngine) return rulesEngine

  rulesEngine = new RegulatoryRulesEngine()

  // Load exchange configurations
  const configs = [TSXConfig, SECConfig] // Add LSEConfig when active

  await rulesEngine.initialize(configs as any)

  return rulesEngine
}

// ============================================================================
// GET /api/regulatory
// List all configured exchanges
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const engine = await initializeEngine()

  // Route: List all exchanges
  if (!searchParams.get('action') && !searchParams.get('exchange')) {
    const exchanges = engine.listExchanges()
    return NextResponse.json(
      {
        message: 'Exchange-Agnostic Regulatory Rules Engine',
        totalExchanges: exchanges.length,
        exchanges: exchanges.map(e => ({
          code: e.code,
          name: e.name,
          country: e.country,
          regulator: e.regulatorName,
          isActive: e.isActive,
        })),
        endpoints: {
          listExchanges: 'GET /api/regulatory',
          getExchange: 'GET /api/regulatory?exchange=tsx',
          getRequirements: 'GET /api/regulatory?exchange=tsx&action=requirements',
          getChecklist: 'GET /api/regulatory?exchange=tsx&action=checklist&filingType=ipo',
          validateFiling: 'POST /api/regulatory/validate',
          compareExchanges: 'GET /api/regulatory/compare?exchanges=tsx,sec',
          validateSection: 'POST /api/regulatory/validate-section',
          getGuidance: 'GET /api/regulatory?exchange=tsx&action=guidance&section=risk_factors',
        },
      },
      { status: 200 }
    )
  }

  // Route: Get specific exchange configuration
  const exchangeCode = searchParams.get('exchange')
  if (exchangeCode) {
    const exchange = engine.getExchange(exchangeCode)
    if (!exchange) {
      return NextResponse.json(
        { error: `Exchange not found: ${exchangeCode}` },
        { status: 404 }
      )
    }

    const action = searchParams.get('action')

    // Get exchange configuration
    if (!action) {
      return NextResponse.json(
        {
          exchange,
          message: 'Use ?action=requirements|checklist|guidance for additional data',
        },
        { status: 200 }
      )
    }

    // Get requirements
    if (action === 'requirements') {
      const category = searchParams.get('category')
      const requirements = engine.getRequirements(exchangeCode, category || undefined)
      return NextResponse.json(
        {
          exchange: exchange.code,
          requirements,
          totalRequirements: requirements.length,
        },
        { status: 200 }
      )
    }

    // Get filing checklist
    if (action === 'checklist') {
      const filingType = searchParams.get('filingType') || 'ipo'
      const checklist = engine.getFilingChecklist(exchangeCode, filingType as any)

      if (!checklist) {
        return NextResponse.json(
          {
            error: `No checklist found for ${exchangeCode} filing type: ${filingType}`,
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          exchange: exchange.code,
          checklist,
        },
        { status: 200 }
      )
    }

    // Get guidance
    if (action === 'guidance') {
      const sectionName = searchParams.get('section')
      if (!sectionName) {
        return NextResponse.json(
          { error: 'Required parameter: section' },
          { status: 400 }
        )
      }

      const guidance = engine.getGuidanceTemplate(exchangeCode, sectionName)
      if (!guidance) {
        return NextResponse.json(
          { error: `No guidance template found for section: ${sectionName}` },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          exchange: exchange.code,
          section: sectionName,
          guidance,
        },
        { status: 200 }
      )
    }

    // Get document requirements
    if (action === 'documents') {
      const filingType = searchParams.get('filingType') || 'ipo'
      const docs = engine.getDocumentRequirements(exchangeCode, filingType as any)
      return NextResponse.json(
        {
          exchange: exchange.code,
          filingType,
          documentRequirements: docs,
        },
        { status: 200 }
      )
    }

    // Get risk factor categories
    if (action === 'risk-factors') {
      const riskFactors = engine.getRiskFactorCategories(exchangeCode)
      return NextResponse.json(
        {
          exchange: exchange.code,
          riskFactors,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        error: `Unknown action: ${action}. Try: requirements, checklist, guidance, documents, risk-factors`,
      },
      { status: 400 }
    )
  }

  // Route: Compare exchanges
  const compareParam = searchParams.get('compare')
  if (compareParam) {
    const exchanges = compareParam.split(',').map(e => e.trim())
    const comparison = exchanges.map(code => {
      const ex = engine.getExchange(code)
      return {
        code,
        found: !!ex,
        name: ex?.name,
        requirements: ex ? engine.getRequirements(code).length : 0,
        validationRules: 0, // Would need to expose this
      }
    })

    return NextResponse.json(
      {
        message: 'Exchange Comparison',
        exchanges: comparison,
      },
      { status: 200 }
    )
  }

  return NextResponse.json(
    {
      error: 'Invalid request. Use ?exchange=CODE or ?compare=CODE1,CODE2',
    },
    { status: 400 }
  )
}

// ============================================================================
// POST /api/regulatory/validate
// Validate filing against exchange rules
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const engine = await initializeEngine()

    const { exchangeCode, filingType, content, documentPath } =
      body as ValidateFilingRequest

    // Validation
    if (!exchangeCode) {
      return NextResponse.json(
        { error: 'Required field: exchangeCode' },
        { status: 400 }
      )
    }

    if (!filingType) {
      return NextResponse.json(
        { error: 'Required field: filingType (ipo|rto|prospectus_supplement|amendment)' },
        { status: 400 }
      )
    }

    // Check exchange exists
    const exchange = engine.getExchange(exchangeCode)
    if (!exchange) {
      return NextResponse.json(
        { error: `Exchange not found: ${exchangeCode}` },
        { status: 404 }
      )
    }

    // Validate filing
    const result = await engine.validateFiling(exchangeCode, filingType, {
      documentPath: documentPath || '',
      documentType: body.documentType,
      textContent: content,
      metadata: body.metadata,
      fileSizeBytes: body.fileSizeBytes,
    })

    const response: ValidateFilingResponse = {
      isValid: result.isValid,
      status: result.status,
      errors: result.errors,
      warnings: result.warnings,
      passedRules: [],
      failedRules: result.errors.map(e => e.ruleId || e.code),
      durationMs: result.durationMs,
      validatedAt: result.validatedAt,
    }

    return NextResponse.json(response, {
      status: result.isValid ? 200 : 422,
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/regulatory/validate-section
// Validate specific prospectus section
// ============================================================================

async function validateSection(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateSectionRequest
    const engine = await initializeEngine()

    const { exchangeCode, sectionName, content } = body

    if (!exchangeCode || !sectionName || !content) {
      return NextResponse.json(
        { error: 'Required fields: exchangeCode, sectionName, content' },
        { status: 400 }
      )
    }

    // Analyze section quality
    const analysis = await engine.analyzeSectionQuality(
      exchangeCode,
      sectionName,
      content
    )

    return NextResponse.json(analysis, { status: 200 })
  } catch (error) {
    console.error('Section validation error:', error)
    return NextResponse.json(
      {
        error: 'Section validation failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// Dynamic routing for nested paths
// ============================================================================
// OPTIONS - CORS support
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
