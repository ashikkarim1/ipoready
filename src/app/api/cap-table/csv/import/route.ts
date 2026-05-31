import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseCSV, importCSV } from '@/lib/csv-importer'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cap-table/csv/import
 * Parse CSV file, validate, and import cap table data
 * 
 * Request: multipart/form-data with 'file' field
 * Response: { success: boolean, rows_imported: number, errors: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const companyId = (session?.user as any)?.companyId

    if (!session || !companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'File must be a CSV file (.csv)' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Parse CSV
    const parseResult = await parseCSV(file)

    // Return early if there are any validation errors
    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          rows_imported: 0,
          errors: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // Import the validated data
    const importResult = await importCSV(companyId, parseResult.preview)

    // Return result (may have partial errors)
    return NextResponse.json(importResult, {
      status: importResult.success ? 200 : 400,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        rows_imported: 0,
        errors: [`Failed to import CSV: ${msg}`],
      },
      { status: 500 }
    )
  }
}
