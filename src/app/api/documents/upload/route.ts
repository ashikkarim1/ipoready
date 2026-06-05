import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const documentId = formData.get('documentId') as string
    const files = formData.getAll('files') as File[]

    if (!documentId || !files.length) {
      return NextResponse.json(
        { error: 'Missing documentId or files' },
        { status: 400 }
      )
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', documentId)
    await mkdir(uploadsDir, { recursive: true })

    const uploadedFiles = []

    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const fileId = uuidv4()
      const fileExt = path.extname(file.name)
      const fileName = `${fileId}${fileExt}`
      const filePath = path.join(uploadsDir, fileName)
      const publicPath = `/uploads/${documentId}/${fileName}`

      await writeFile(filePath, Buffer.from(buffer))

      uploadedFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        publicPath,
      })
    }

    return NextResponse.json({
      success: true,
      documentId,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
