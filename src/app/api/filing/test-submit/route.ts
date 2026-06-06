/**
 * POST /api/filing/test-submit
 * Test endpoint for filing system integration
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName = 'Test IPO Corp', countryCode = 'US', includeErrors = false } = body

    if (!['CA', 'US'].includes(countryCode)) {
      return NextResponse.json(
        { error: 'Invalid countryCode. Must be CA or US.' },
        { status: 400 }
      )
    }

    if (includeErrors) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: [{ field: 'prospectus', message: 'Missing signature', code: 'MISSING_SIGNATURE' }],
        status: 'rejected'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      filingId: `test-${Date.now()}`,
      referenceNumber: `${countryCode}-${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      message: 'Test submission successful'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Test submission failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  })
}
