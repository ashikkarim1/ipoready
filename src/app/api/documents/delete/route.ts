import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { unlink } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, fileId } = await request.json()

    if (!documentId || !fileId) {
      return NextResponse.json(
        { error: 'Missing documentId or fileId' },
        { status: 400 }
      )
    }

    const filePath = path.join(
      process.cwd(),
      'public',
      'uploads',
      documentId,
      `${fileId}.*`
    )

    try {
      await unlink(filePath)
    } catch (e) {
      console.log('File already deleted or not found')
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
