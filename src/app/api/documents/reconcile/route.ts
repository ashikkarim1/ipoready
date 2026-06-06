/**
 * API Route: POST /api/documents/reconcile
 *
 * Triggers full document reconciliation
 * Ensures zero duplication + perfect consistency
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/react'
import { authOptions } from '@/lib/auth'
import { DocumentReconciliationService } from '@/lib/document-reconciliation-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId

    console.log(`[api:reconcile] Starting reconciliation for company ${companyId}`)

    // Run full reconciliation
    const report = await DocumentReconciliationService.fullReconciliation(companyId)

    return NextResponse.json({
      success: true,
      status: report.status,
      summary: {
        totalDocumentsInUnified: report.totalDocumentsInUnified,
        totalDocumentsInLegacy: report.totalDocumentsInLegacy,
        duplicatesFound: report.duplicatesFound,
        duplicatesResolved: report.duplicatesResolved,
        inconsistenciesFound: report.inconsistenciesFound,
        inconsistenciesResolved: report.inconsistenciesResolved
      },
      issues: report.issues,
      timestamp: report.timestamp
    })
  } catch (err) {
    console.error('[api:reconcile] Reconciliation failed:', err)

    return NextResponse.json(
      {
        error: 'Reconciliation failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/reconcile?check=perfect
 *
 * Check if system is in perfect reconciliation state
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyId = user.companyId
    const check = request.nextUrl.searchParams.get('check')

    if (check === 'perfect') {
      // Quick check if system is perfect (no full reconciliation needed yet)
      const isPerfect = await DocumentReconciliationService.isPerfectReconciliation(companyId)

      return NextResponse.json({
        isPerfect,
        status: isPerfect ? 'ready-for-production' : 'needs-reconciliation'
      })
    }

    return NextResponse.json({
      error: 'Unknown check type',
      supportedChecks: ['perfect']
    }, { status: 400 })
  } catch (err) {
    console.error('[api:reconcile:get] Check failed:', err)

    return NextResponse.json(
      {
        error: 'Check failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
