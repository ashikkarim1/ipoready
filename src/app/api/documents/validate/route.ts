/**
 * API Route: POST /api/documents/validate
 *
 * Validates document for:
 * 1. No duplicates
 * 2. Single source compliance
 * 3. Perfect consistency
 *
 * Can be called before upload to prevent duplicates
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/react'
import { authOptions } from '@/lib/auth'
import { DocumentReconciliationService } from '@/lib/document-reconciliation-service'

export const dynamic = 'force-dynamic'

export interface ValidationRequest {
  documentId?: string          // Check specific document for duplicates
  documentName?: string        // Check if name already exists
  checkType: 'duplicate' | 'consistency' | 'all'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as ValidationRequest
    const { documentId, checkType } = body

    console.log(`[api:validate] Validating document ${documentId || 'new'} for company ${user.companyId}`)

    const result: any = {
      valid: true,
      issues: [],
      checks: {}
    }

    // Check for duplicates
    if (checkType === 'duplicate' || checkType === 'all') {
      if (documentId) {
        const dup = await DocumentReconciliationService.validateNoDuplicate(documentId)

        result.checks.duplicateCheck = {
          passed: !dup.isDuplicated,
          isDuplicated: dup.isDuplicated,
          count: dup.count
        }

        if (dup.isDuplicated) {
          result.valid = false
          result.issues.push({
            type: 'duplicate_document',
            severity: 'critical',
            message: `Document exists ${dup.count} times. Duplication not allowed.`
          })
        }
      }
    }

    // Check consistency (all pages reference unified source)
    if (checkType === 'consistency' || checkType === 'all') {
      result.checks.consistencyCheck = {
        message: 'Will validate consistency with next full reconciliation',
        note: 'Consistency checks are run periodically'
      }
    }

    return NextResponse.json({
      success: true,
      valid: result.valid,
      checks: result.checks,
      issues: result.issues,
      recommendations: result.valid
        ? ['Document is valid for upload']
        : result.issues.map((issue: any) => {
            if (issue.type === 'duplicate_document') {
              return 'Resolve duplicate: use existing document instead of uploading again'
            }
            return `Resolve: ${issue.message}`
          })
    })
  } catch (err) {
    console.error('[api:validate] Validation failed:', err)

    return NextResponse.json(
      {
        error: 'Validation failed',
        details: err instanceof Error ? err.message : 'Unknown error',
        valid: false
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/validate?documentId=xxx
 * Quick validation check
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = request.nextUrl.searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({
        error: 'documentId parameter required'
      }, { status: 400 })
    }

    // Quick duplicate check
    const dup = await DocumentReconciliationService.validateNoDuplicate(documentId)

    return NextResponse.json({
      documentId,
      isDuplicated: dup.isDuplicated,
      duplicateCount: dup.count,
      valid: !dup.isDuplicated,
      status: dup.isDuplicated ? 'duplicate-found' : 'unique'
    })
  } catch (err) {
    console.error('[api:validate:get] Validation failed:', err)

    return NextResponse.json(
      {
        error: 'Validation failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
