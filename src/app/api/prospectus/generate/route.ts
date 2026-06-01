/**
 * POST /api/prospectus/generate
 * Generates a prospectus document for a company
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateProspectus } from '@/lib/prospectus-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exchange, format = 'docx', sections } = body

    const validExchanges = ['tsx', 'tsxv', 'cse', 'nasdaq', 'nyse', 'otc', 'cboe']
    const validFormats = ['docx', 'pdf']

    if (!exchange || !validExchanges.includes(exchange)) {
      return NextResponse.json(
        { error: 'Invalid exchange', valid: validExchanges },
        { status: 400 }
      )
    }

    if (!validFormats.includes(format)) {
      return NextResponse.json({ error: 'Invalid format (use "docx" or "pdf")' }, { status: 400 })
    }

    const startTime = Date.now()
    const result = await generateProspectus({
      companyId: user.companyId,
      exchange: exchange as any,
      format: format as 'docx' | 'pdf',
      sections,
    })
    const generationTime = Date.now() - startTime

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      documentUrl: result.documentUrl,
      documentSize: result.documentSize,
      completeness: result.completeness,
      generationTimeMs: generationTime,
      metadata: {
        wordCount: result.metadata?.wordCount,
        pageCount: result.metadata?.pageCount,
        sectionsIncluded: result.metadata?.sectionsIncluded,
      },
      warnings: result.warnings || [],
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Prospectus generation error:', error)

    return NextResponse.json(
      { success: false, error: 'Prospectus generation failed', details: errorMessage },
      { status: 500 }
    )
  }
}
