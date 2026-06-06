import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/documents/list
 * Fetch documents for a company
 * Client-side safe endpoint (doesn't expose server-only code)
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    const category = request.nextUrl.searchParams.get('category')

    if (!companyId) {
      return NextResponse.json({
        error: 'companyId required',
      }, { status: 400 })
    }

    let query = 'SELECT * FROM unified_documents WHERE company_id = $1'
    const params: any[] = [companyId]

    if (category) {
      query += ` AND category = $2`
      params.push(category)
    }

    query += ' ORDER BY uploaded_at DESC'

    const documents = await sql(query, params)

    return NextResponse.json({
      documents: documents || [],
      count: documents?.length || 0,
    })
  } catch (error) {
    console.error('List documents error:', error)
    return NextResponse.json({
      error: 'Failed to fetch documents',
      documents: [],
      count: 0,
    }, { status: 500 })
  }
}
