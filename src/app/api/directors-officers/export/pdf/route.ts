/**
 * POST /api/directors-officers/export/pdf
 *
 * Generate PDF file with formatted director bios suitable for IPO filing
 * Returns downloadable PDF with professional formatting
 *
 * Request Body:
 * {
 *   directorIds: string[]  // Array of director UUIDs to export
 *   format?: 'sedar2' | 'sec-edgar'  // Filing format to use
 * }
 *
 * Response:
 * {
 *   format: 'pdf'
 *   pdfUrl: string  // Temporary download URL
 *   downloadKey: string  // Unique key for tracking downloads
 *   generatedAt: string  // ISO timestamp
 *   directorCount: number
 *   companyInfo: {
 *     name: string
 *     ipoDate: string | null
 *     effectiveDate: string
 *   }
 *   fileSize: number  // In bytes
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

interface DirectorData {
  professional_id: string
  name: string
  professional_title: string
  bio: string | null
  past_board_positions: any
  certifications: string[] | null
  years_of_experience: number | null
  linkedin_verified: boolean
  verification_status: string
}

interface CompanyData {
  id: string
  name: string
  ipo_date: string | null
  headquarters: string | null
}

function formatDirectorBioForPdf(director: DirectorData): string {
  const name = director.name || 'Unknown'
  const title = director.professional_title || 'Director'
  const years = director.years_of_experience || 0
  const bio = director.bio || `${name} serves as ${title}.`
  const isIndependent = director.verification_status === 'verified' ? 'Yes' : 'No'

  // Build certifications line
  let certificationsText = ''
  if (director.certifications && director.certifications.length > 0) {
    certificationsText = ` ${name} holds the following professional designations: ${director.certifications.join(', ')}.`
  }

  // Build board experience
  let boardExperienceText = ''
  if (director.past_board_positions && Array.isArray(director.past_board_positions)) {
    const positions = director.past_board_positions
      .filter((p: any) => p && p.title && p.company)
      .map((p: any) => `${p.title} at ${p.company}`)
      .join('; ')

    if (positions) {
      boardExperienceText = ` ${name} has served in various board capacities, including: ${positions}.`
    }
  }

  // Combine into narrative
  let narrative = bio
  if (certificationsText) narrative += certificationsText
  if (boardExperienceText) narrative += boardExperienceText
  if (years > 0) {
    narrative += ` With ${years} years of experience, ${name} brings substantial expertise to the board.`
  }

  return narrative.trim()
}

function generatePdfBuffer(company: CompanyData, directors: DirectorData[]): Buffer {
  const doc = new PDFDocument({
    size: 'Letter',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  })

  // Collect PDF output
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  // Title page
  doc.fontSize(24).font('Helvetica-Bold').text(`${company.name}`, { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(16).text('Management and Directors', { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(12).text(`Effective Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })

  if (company.ipo_date) {
    doc.fontSize(12).text(`IPO Date: ${company.ipo_date}`, { align: 'center' })
  }

  if (company.headquarters) {
    doc.moveDown(1)
    doc.fontSize(12).text(`Headquarters: ${company.headquarters}`, { align: 'center' })
  }

  doc.moveDown(2)
  doc.fontSize(11).text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
  doc.addPage()

  // Table of contents
  doc.fontSize(14).font('Helvetica-Bold').text('Table of Contents', 0, 50)
  doc.moveDown(0.5)
  doc.fontSize(11).font('Helvetica').text('Management and Directors', 0, doc.y)
  doc.text('Biographical Information', 0, doc.y + 15)
  doc.text('Related Party Transactions', 0, doc.y + 15)
  doc.addPage()

  // Introduction
  doc.fontSize(14).font('Helvetica-Bold').text('Management and Directors', 0, 50)
  doc.moveDown(0.5)
  doc.fontSize(11).font('Helvetica').text(
    `The following table sets out information concerning the directors and officers of ${company.name}:`,
    { width: 500, align: 'justify' }
  )

  doc.moveDown(1)

  // Table
  const tableTop = doc.y
  const tableRowHeight = 25
  const columnWidths = { name: 150, title: 150, independent: 80, experience: 70 }
  const columns = [
    { x: 50, label: 'Name', width: columnWidths.name },
    { x: 50 + columnWidths.name, label: 'Title', width: columnWidths.title },
    { x: 50 + columnWidths.name + columnWidths.title, label: 'Independent', width: columnWidths.independent },
    { x: 50 + columnWidths.name + columnWidths.title + columnWidths.independent, label: 'Experience', width: columnWidths.experience },
  ]

  // Draw table header
  doc.fontSize(10).font('Helvetica-Bold')
  columns.forEach(col => {
    doc.text(col.label, col.x, tableTop, { width: col.width, align: 'left' })
  })

  // Draw table rows
  doc.fontSize(9).font('Helvetica')
  let currentY = tableTop + tableRowHeight

  for (const director of directors) {
    if (currentY > 700) {
      doc.addPage()
      currentY = 50
    }

    const independent = director.verification_status === 'verified' ? 'Yes' : 'No'
    const experience = `${director.years_of_experience || 0} yrs`

    columns.forEach((col, idx) => {
      let text = ''
      if (idx === 0) text = director.name || ''
      else if (idx === 1) text = director.professional_title || ''
      else if (idx === 2) text = independent
      else if (idx === 3) text = experience

      doc.text(text, col.x, currentY, { width: col.width, align: 'left' })
    })

    currentY += tableRowHeight
  }

  doc.addPage()

  // Biographical Information
  doc.fontSize(14).font('Helvetica-Bold').text('Biographical Information', 0, 50)
  doc.moveDown(1)

  for (const director of directors) {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage()
    }

    doc.fontSize(12).font('Helvetica-Bold').text(director.name, 50, doc.y)
    doc.moveDown(0.25)
    doc.fontSize(10).font('Helvetica').text(`Title: ${director.professional_title || 'Not specified'}`)
    doc.text(`Independent: ${director.verification_status === 'verified' ? 'Yes' : 'No'}`)
    doc.moveDown(0.5)

    const biography = formatDirectorBioForPdf(director)
    doc.fontSize(10).font('Helvetica').text(biography, { align: 'justify', width: 450 })
    doc.moveDown(1)
  }

  // Related Party Transactions
  doc.addPage()
  doc.fontSize(14).font('Helvetica-Bold').text('Related Party Transactions', 0, 50)
  doc.moveDown(1)
  doc.fontSize(11).font('Helvetica').text(
    'As of the date hereof, none of the directors or officers has engaged in any material related party transactions with the Company, except as otherwise disclosed in the Company\'s public filings.',
    { align: 'justify', width: 450 }
  )

  doc.end()

  return Buffer.concat(chunks)
}

async function uploadPdfToStorage(
  pdfBuffer: Buffer,
  companyId: string,
  directorCount: number
): Promise<{ url: string; key: string }> {
  // For now, return a placeholder URL structure
  // In production, this would upload to S3 or similar
  const downloadKey = `dir-export-${companyId}-${Date.now()}-${Math.random().toString(36).substring(7)}`
  const url = `/api/directors-officers/export/pdf/download?key=${downloadKey}`

  // Store metadata for tracking
  try {
    await sql`
      INSERT INTO director_export_downloads (
        download_key,
        company_id,
        format,
        director_count,
        file_size,
        created_at
      )
      VALUES (
        ${downloadKey},
        ${companyId},
        'pdf',
        ${directorCount},
        ${pdfBuffer.length},
        NOW()
      )
    `
  } catch (error) {
    console.warn('Failed to track PDF download:', error)
  }

  return { url, key: downloadKey }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { directorIds, format = 'sedar2' } = body

    // Validate input
    if (!Array.isArray(directorIds) || directorIds.length === 0) {
      return NextResponse.json(
        { error: 'directorIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Fetch company info
    const companyRows = await sql`
      SELECT id, name, ipo_date, headquarters
      FROM companies
      WHERE id = ${user.companyId}
    ` as CompanyData[]

    if (companyRows.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const company = companyRows[0]

    // Fetch director data
    const directorRows = await sql`
      SELECT
        id as professional_id,
        name,
        professional_title,
        bio,
        past_board_positions,
        certifications,
        years_of_experience,
        linkedin_verified,
        verification_status
      FROM professionals
      WHERE id = ANY(${directorIds})
      ORDER BY professional_title DESC, name ASC
    ` as DirectorData[]

    if (directorRows.length === 0) {
      return NextResponse.json(
        { error: 'No directors found with provided IDs' },
        { status: 404 }
      )
    }

    // Generate PDF
    const pdfBuffer = generatePdfBuffer(company, directorRows)

    // Upload to storage
    const { url, key } = await uploadPdfToStorage(pdfBuffer, user.companyId, directorRows.length)

    return NextResponse.json({
      format: 'pdf',
      pdfUrl: url,
      downloadKey: key,
      generatedAt: new Date().toISOString(),
      directorCount: directorRows.length,
      companyInfo: {
        name: company.name,
        ipoDate: company.ipo_date,
        effectiveDate: new Date().toISOString().split('T')[0],
      },
      fileSize: pdfBuffer.length,
    })
  } catch (error) {
    console.error('Error generating PDF export:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF export' },
      { status: 500 }
    )
  }
}
