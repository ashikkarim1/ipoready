/**
 * POST /api/directors-officers/export/sedar2
 *
 * Generate SEDAR 2 formatted filing content for directors and officers
 * Returns structured text with table format and biographical narratives
 *
 * Request Body:
 * {
 *   directorIds: string[]  // Array of director UUIDs to export
 * }
 *
 * Response:
 * {
 *   format: 'text'
 *   sedar2Content: string  // Full SEDAR2 formatted text
 *   generatedAt: string    // ISO timestamp
 *   directorCount: number
 *   companyInfo: {
 *     name: string
 *     ipoDate: string | null
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

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

function formatDirectorBiography(director: DirectorData): string {
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

  // Combine into narrative (3-5 sentences)
  let narrative = bio
  if (certificationsText) narrative += certificationsText
  if (boardExperienceText) narrative += boardExperienceText

  // Add experience summary
  if (years > 0) {
    narrative += ` With ${years} years of experience in the industry, ${name} brings substantial expertise to the board.`
  }

  return narrative.trim()
}

function generateSedar2Content(company: CompanyData, directors: DirectorData[]): string {
  let content = ''

  // Header
  content += 'MANAGEMENT AND DIRECTORS\n'
  content += '='.repeat(80) + '\n\n'

  // Introduction
  content += 'The following table sets out information concerning the directors and officers of '
  content += `${company.name}:\n\n`

  // Table Header
  const columnWidths = {
    name: 25,
    title: 30,
    independent: 15,
    experience: 12,
    education: 20,
  }

  const headers = ['Name', 'Title', 'Independent', 'Experience', 'Education']
  const headerLine = headers
    .map((h, i) => {
      const widths = Object.values(columnWidths)
      return h.padEnd(widths[i])
    })
    .join(' | ')

  content += headerLine + '\n'
  content += '-'.repeat(headerLine.length) + '\n'

  // Table rows
  for (const director of directors) {
    const name = (director.name || '').substring(0, columnWidths.name - 1).padEnd(columnWidths.name)
    const title = (director.professional_title || '').substring(0, columnWidths.title - 1).padEnd(columnWidths.title)
    const independent = director.verification_status === 'verified' ? 'Yes'.padEnd(columnWidths.independent) : 'No'.padEnd(columnWidths.independent)
    const experience = `${director.years_of_experience || 0}yrs`.padEnd(columnWidths.experience)
    const education = (director.certifications?.length || 0) > 0 ? 'Yes'.padEnd(columnWidths.education) : 'No'.padEnd(columnWidths.education)

    content += `${name} | ${title} | ${independent} | ${experience} | ${education}\n`
  }

  content += '\n\n'
  content += 'BIOGRAPHICAL INFORMATION\n'
  content += '='.repeat(80) + '\n\n'

  // Biographical narratives
  for (const director of directors) {
    content += `${director.name}\n`
    content += '-'.repeat(director.name.length) + '\n'
    content += `Title: ${director.professional_title || 'Not specified'}\n`
    content += `Independent: ${director.verification_status === 'verified' ? 'Yes' : 'No'}\n`
    content += `\n${formatDirectorBiography(director)}\n\n`
  }

  // Related Party Transactions
  content += 'RELATED PARTY TRANSACTIONS\n'
  content += '='.repeat(80) + '\n\n'
  content += 'As of the date hereof, none of the directors or officers has engaged in any material '
  content += 'related party transactions with the Company, except as otherwise disclosed in the '
  content += 'Company\'s public filings.\n\n'

  // Footer
  content += '='.repeat(80) + '\n'
  content += `Generated: ${new Date().toISOString()}\n`
  if (company.ipo_date) {
    content += `IPO Date: ${company.ipo_date}\n`
  }

  return content
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { directorIds } = body

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

    // Generate SEDAR2 content
    const sedar2Content = generateSedar2Content(company, directorRows)

    return NextResponse.json({
      format: 'text',
      sedar2Content,
      generatedAt: new Date().toISOString(),
      directorCount: directorRows.length,
      companyInfo: {
        name: company.name,
        ipoDate: company.ipo_date,
      },
    })
  } catch (error) {
    console.error('Error generating SEDAR2 export:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEDAR2 export' },
      { status: 500 }
    )
  }
}
