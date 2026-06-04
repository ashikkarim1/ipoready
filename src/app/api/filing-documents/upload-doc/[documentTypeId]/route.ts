import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

interface UploadResponse {
  success: boolean
  fileUrl?: string
  documentId?: string
  status?: string
  error?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { documentTypeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; companyId?: string } | undefined

    if (!session || !user?.companyId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = user.companyId
    const userId = user.id
    const documentTypeId = params.documentTypeId

    // Validate document type exists
    const docTypeResult = await sql`
      SELECT id FROM filing_document_types WHERE id = ${documentTypeId}
    `

    if (!docTypeResult || docTypeResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Create filing documents directory if it doesn't exist
    const fileDir = join(process.cwd(), 'public', 'filing-docs', companyId)
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${documentTypeId}-${timestamp}-${randomStr}.pdf`
    const filePath = join(fileDir, fileName)

    // Write file
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    const fileUrl = `/filing-docs/${companyId}/${fileName}`

    // Check if document already exists for this company/type combination
    const existingDoc = await sql`
      SELECT id, version_number FROM user_filing_documents
      WHERE company_id = ${companyId} AND document_type_id = ${documentTypeId}
    `

    let documentId: string
    let newVersionNumber = 1

    if (existingDoc && existingDoc.length > 0) {
      // Update existing document
      documentId = existingDoc[0].id
      newVersionNumber = (existingDoc[0].version_number || 1) + 1

      await sql`
        UPDATE user_filing_documents
        SET
          file_path = ${filePath},
          s3_url = ${fileUrl},
          status = 'uploaded',
          uploaded_at = NOW(),
          uploaded_by = ${userId},
          version_number = ${newVersionNumber},
          updated_at = NOW()
        WHERE id = ${documentId}
      `
    } else {
      // Create new document entry
      const insertResult = await sql`
        INSERT INTO user_filing_documents (
          company_id,
          document_type_id,
          file_path,
          s3_url,
          status,
          uploaded_at,
          uploaded_by,
          version_number
        )
        VALUES (${companyId}, ${documentTypeId}, ${filePath}, ${fileUrl}, 'uploaded', NOW(), ${userId}, 1)
        RETURNING id
      `

      documentId = insertResult[0].id
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      documentId,
      status: 'uploaded',
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    )
  }
}
