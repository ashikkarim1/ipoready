import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  documentId: z.string().uuid(),
  companyId: z.string().uuid(),
  format: z.enum(['json', 'csv', 'prospectus']).optional(),
})

/**
 * GET /api/cap-table/export?documentId=X&companyId=Y&format=prospectus
 * Export cap table data in various formats
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const documentId = searchParams.get('documentId')
    const companyId = searchParams.get('companyId')
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv' | 'prospectus'

    if (!documentId || !companyId) {
      return NextResponse.json(
        { error: 'Missing documentId or companyId' },
        { status: 400 }
      )
    }

    QuerySchema.parse({ documentId, companyId, format })

    if (user.companyId && user.companyId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch document
    const docRows = await sql`
      SELECT
        id,
        file_name,
        document_data
      FROM cap_table_documents
      WHERE id = ${documentId} AND company_id = ${companyId}
      LIMIT 1
    ` as any[]

    if (docRows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = docRows[0]

    // Fetch all related data
    const shareClassRows = await sql`
      SELECT * FROM share_classes_v2
      WHERE document_id = ${documentId}
    `

    const shareholderRows = await sql`
      SELECT * FROM shareholders
      WHERE document_id = ${documentId}
    `

    const holdingRows = await sql`
      SELECT * FROM holdings
      WHERE document_id = ${documentId}
    `

    const vestingRows = await sql`
      SELECT * FROM vesting_schedules
      WHERE document_id = ${documentId}
    `

    const transactionRows = await sql`
      SELECT * FROM cap_table_transactions
      WHERE document_id = ${documentId}
    `

    // Build comprehensive dataset
    const capTableData = {
      document: {
        id: doc.id,
        fileName: doc.file_name,
        exportedAt: new Date().toISOString(),
      },
      shareClasses: shareClassRows,
      shareholders: shareholderRows,
      holdings: holdingRows,
      vestingSchedules: vestingRows,
      transactions: transactionRows,
    }

    if (format === 'json') {
      // Return as JSON download
      return new NextResponse(JSON.stringify(capTableData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="cap-table-${documentId}.json"`,
        },
      })
    } else if (format === 'csv') {
      // Convert to CSV format (holdings table)
      const csv = convertToCSV(holdingRows, shareholderRows, shareClassRows)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="cap-table-holdings-${documentId}.csv"`,
        },
      })
    } else if (format === 'prospectus') {
      // Generate prospectus section with cap table summary
      const prospectusSection = generateProspectusSummary(capTableData)
      return new NextResponse(prospectusSection, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="cap-table-prospectus-${documentId}.txt"`,
        },
      })
    }

    return NextResponse.json(capTableData)
  } catch (error) {
    console.error('[GET /api/cap-table/export] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function convertToCSV(holdings: any[], shareholders: any[], shareClasses: any[]): string {
  const headers = ['Shareholder', 'Share Class', 'Quantity', 'Percentage']
  const totalShares = holdings.reduce((sum, h) => sum + (h.quantity || 0), 0)

  const rows = holdings.map(h => {
    const shareholder = shareholders.find((s: any) => s.id === h.shareholder_id)
    const shareClass = shareClasses.find((sc: any) => sc.id === h.share_class_id)
    const percentage = totalShares > 0 ? ((h.quantity / totalShares) * 100).toFixed(2) : '0.00'

    return [
      shareholder?.name || 'Unknown',
      shareClass?.name || 'Unknown',
      h.quantity,
      percentage + '%',
    ].map(v => `"${v}"`)
  })

  return [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n')
}

function generateProspectusSummary(data: any): string {
  const { document, shareholders, shareClasses, holdings } = data
  const totalShares = holdings.reduce((sum: number, h: any) => sum + (h.quantity || 0), 0)

  let summary = 'CAPITALIZATION TABLE SUMMARY FOR PROSPECTUS\n'
  summary += '=' + '='.repeat(60) + '\n\n'

  summary += `Document: ${document.fileName}\n`
  summary += `Date: ${document.exportedAt}\n\n`

  summary += 'SHARE CLASS SUMMARY\n'
  summary += '-'.repeat(60) + '\n'
  shareClasses.forEach((sc: any) => {
    const classHoldings = holdings.filter((h: any) => h.share_class_id === sc.id)
    const classShares = classHoldings.reduce((sum: number, h: any) => sum + (h.quantity || 0), 0)
    summary += `${sc.name}: ${classShares} shares\n`
  })

  summary += '\nSHAREHOLDER OWNERSHIP\n'
  summary += '-'.repeat(60) + '\n'
  shareholders.forEach((sh: any) => {
    const shHoldings = holdings.filter((h: any) => h.shareholder_id === sh.id)
    const shShares = shHoldings.reduce((sum: number, h: any) => sum + (h.quantity || 0), 0)
    const percentage = totalShares > 0 ? ((shShares / totalShares) * 100).toFixed(2) : '0.00'
    summary += `${sh.name}: ${shShares} shares (${percentage}%)\n`
  })

  summary += '\nTOTAL CAPITALIZATION\n'
  summary += '-'.repeat(60) + '\n'
  summary += `Total Shares Outstanding: ${totalShares}\n`
  summary += `Number of Shareholders: ${shareholders.length}\n`

  return summary
}
