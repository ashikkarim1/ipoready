import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PDFDocument from 'pdfkit'

export const dynamic = 'force-dynamic'

interface ExportRequest {
  breakdown: {
    legal: number
    accounting: number
    underwriting: number
    printing: number
    filing: number
    contingency: number
  }
  subtotal: number
  total: number
  ipoSizeEstimate: number
  costAsPercentageOfIPO: string
  benchmarks: {
    category: string
    ipoSize: number
    avgTotalCost: number
    costRange: { min: number; max: number }
    legalRange: { min: number; max: number }
    accountingRange: { min: number; max: number }
    underwritingRange: { min: number; max: number }
  }
  companyRevenue?: number
  selectedExchange?: string
  complexityLevel?: string
  timelineMonths?: number
}

/**
 * POST /api/financial/cost-calculator/export-pdf
 * Generate a PDF report of cost calculation
 */
export async function POST(req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as ExportRequest

    // Create PDF document
    const doc = new PDFDocument({
      size: 'LETTER',
      margin: 50,
    })

    // Set document metadata
    doc.info({
      Title: 'IPO Cost Calculator Report',
      Author: 'IPOReady',
      Subject: 'IPO Cost Estimation',
      Keywords: 'IPO, Costs, Calculator',
      CreationDate: new Date(),
    })

    // Collect PDF data
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('IPO Cost Calculator Report', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(1)

    // Executive Summary
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Executive Summary')
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.5)

    doc.fontSize(11).font('Helvetica-Bold').text('Estimated Total IPO Costs')
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#3b82f6').text(`$${body.total.toLocaleString()}`)
    doc.fillColor('#000000').moveDown(0.3)

    doc.fontSize(10).font('Helvetica').text(`Estimated IPO Size: $${body.ipoSizeEstimate.toLocaleString()}`)
    doc.text(`Cost as % of IPO: ${body.costAsPercentageOfIPO}% of proceeds`)
    doc.moveDown(0.8)

    // Input Parameters
    if (body.selectedExchange || body.complexityLevel) {
      doc.fontSize(12).font('Helvetica-Bold').text('Input Parameters')
      if (body.selectedExchange) {
        doc.fontSize(10).font('Helvetica').text(`Stock Exchange: ${body.selectedExchange}`)
      }
      if (body.complexityLevel) {
        doc.fontSize(10).font('Helvetica').text(`Complexity Level: ${body.complexityLevel.charAt(0).toUpperCase() + body.complexityLevel.slice(1)}`)
      }
      if (body.timelineMonths) {
        doc.fontSize(10).font('Helvetica').text(`Timeline: ${body.timelineMonths} months`)
      }
      doc.moveDown(0.8)
    }

    // Cost Breakdown Table
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Cost Breakdown')
    doc.moveDown(0.3)

    // Table headers
    const tableTop = doc.y
    const col1 = 50
    const col2 = 350
    const col3 = 450

    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('Cost Category', col1, tableTop)
    doc.text('Amount', col2, tableTop)
    doc.text('% of Total', col3, tableTop)

    let tableY = tableTop + 20
    doc.moveTo(50, tableY - 5).lineTo(550, tableY - 5).stroke()

    const costItems = [
      { name: 'Legal Fees', amount: body.breakdown.legal },
      { name: 'Accounting Fees', amount: body.breakdown.accounting },
      { name: 'Underwriting Costs', amount: body.breakdown.underwriting },
      { name: 'Printing & Disclosure', amount: body.breakdown.printing },
      { name: 'SEC/Exchange Filing Fees', amount: body.breakdown.filing },
      { name: 'Contingency (10%)', amount: body.breakdown.contingency },
    ]

    doc.fontSize(9).font('Helvetica')
    costItems.forEach(item => {
      const percentage = ((item.amount / body.total) * 100).toFixed(1)
      doc.text(item.name, col1, tableY)
      doc.text(`$${item.amount.toLocaleString()}`, col2, tableY)
      doc.text(`${percentage}%`, col3, tableY)
      tableY += 18
    })

    // Total row
    doc.moveTo(50, tableY).lineTo(550, tableY).stroke()
    doc.font('Helvetica-Bold').fillColor('#3b82f6')
    doc.text('TOTAL ESTIMATED COSTS', col1, tableY + 5)
    doc.text(`$${body.total.toLocaleString()}`, col2, tableY + 5)
    doc.text('100.0%', col3, tableY + 5)

    doc.moveDown(1.5)

    // Industry Benchmarks
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Industry Benchmarks')
    doc.moveDown(0.3)

    const benchmarkData = [
      ['IPO Category', body.benchmarks.category.charAt(0).toUpperCase() + body.benchmarks.category.slice(1)],
      ['Your Estimated Cost', `$${body.total.toLocaleString()}`],
      ['Industry Average Cost', `$${body.benchmarks.avgTotalCost.toLocaleString()}`],
      ['Industry Cost Range', `$${body.benchmarks.costRange.min.toLocaleString()} - $${body.benchmarks.costRange.max.toLocaleString()}`],
      ['Legal Fees Range', `$${body.benchmarks.legalRange.min.toLocaleString()} - $${body.benchmarks.legalRange.max.toLocaleString()}`],
      ['Accounting Fees Range', `$${body.benchmarks.accountingRange.min.toLocaleString()} - $${body.benchmarks.accountingRange.max.toLocaleString()}`],
      ['Underwriting Range', `$${body.benchmarks.underwritingRange.min.toLocaleString()} - $${body.benchmarks.underwritingRange.max.toLocaleString()}`],
    ]

    const benchmarkTableTop = doc.y
    const benchCol1 = 50
    const benchCol2 = 300

    doc.fontSize(9).font('Helvetica-Bold')
    doc.text('Metric', benchCol1, benchmarkTableTop)
    doc.text('Value', benchCol2, benchmarkTableTop)

    let benchY = benchmarkTableTop + 18
    doc.moveTo(50, benchY - 5).lineTo(550, benchY - 5).stroke()

    doc.fontSize(9).font('Helvetica')
    benchmarkData.forEach(([metric, value]) => {
      doc.text(metric, benchCol1, benchY)
      doc.text(value, benchCol2, benchY)
      benchY += 16
    })

    doc.moveTo(50, benchY).lineTo(550, benchY).stroke()

    doc.moveDown(1.5)

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#999999')
    doc.text('This report is generated by IPOReady Cost Calculator. All estimates are based on historical benchmarks and may vary.', 50, doc.y, {
      width: 500,
      align: 'center',
    })

    // End document
    doc.end()

    // Wait for document to finish writing
    return new Promise((resolve, reject) => {
      doc.on('finish', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="IPO-Cost-Calculator-${new Date().toISOString().split('T')[0]}.pdf"`,
            },
          })
        )
      })

      doc.on('error', (error: any) => {
        reject(error)
      })
    })
  } catch (error) {
    console.error('[POST /api/financial/cost-calculator/export-pdf] Error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
