/**
 * POST /api/directors-officers/export/sec-edgar
 *
 * Generate SEC Edgar formatted filing content for directors and officers
 * Returns HTML/text with detailed biographical information and governance expertise
 *
 * Request Body:
 * {
 *   directorIds: string[]  // Array of director UUIDs to export
 *   format?: 'html' | 'text'  // Output format, default 'html'
 * }
 *
 * Response:
 * {
 *   format: 'html' | 'text'
 *   content: string  // Full SEC Edgar formatted content
 *   generatedAt: string  // ISO timestamp
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
  industries: string[] | null
}

interface CompanyData {
  id: string
  name: string
  ipo_date: string | null
}

function calculateAge(yearsExperience: number): string {
  // Conservative age estimate based on experience (assume career start at 25)
  const estimatedAge = Math.min(25 + (yearsExperience || 0), 75)
  return estimatedAge.toString()
}

function formatSecEdgarBiography(director: DirectorData): string {
  const name = director.name || 'Unknown'
  const title = director.professional_title || 'Director'
  const yearsExp = director.years_of_experience || 0
  const age = calculateAge(yearsExp)

  // Main biography paragraph
  let biography = `${name}, age ${age}, has served as our ${title.toLowerCase()} since [DATE]. `

  // Experience and expertise
  if (director.bio) {
    biography += director.bio + ' '
  } else {
    biography += `With ${yearsExp} years of experience in the industry, ${name} brings substantial expertise and strategic insights to our board. `
  }

  // Industry focus
  if (director.industries && director.industries.length > 0) {
    biography += `${name}'s expertise spans ${director.industries.join(', ')}. `
  }

  // Professional credentials
  if (director.certifications && director.certifications.length > 0) {
    biography += `${name} is a ${director.certifications[0]}`
    if (director.certifications.length > 1) {
      biography += ` and holds additional certifications including ${director.certifications.slice(1).join(', ')}`
    }
    biography += '. '
  }

  // Board experience and governance expertise
  if (director.past_board_positions && Array.isArray(director.past_board_positions)) {
    const significantPositions = director.past_board_positions
      .filter((p: any) => p && p.title && p.company && (p.title.toLowerCase().includes('audit') || p.title.toLowerCase().includes('committee') || p.title.toLowerCase().includes('chair')))
      .slice(0, 3)

    if (significantPositions.length > 0) {
      biography += `${name} has demonstrated expertise in corporate governance and board service, having served as `
      biography += significantPositions.map((p: any) => `${p.title} at ${p.company}`).join(', ')
      biography += '. '
    }
  }

  // Independence and tenure
  const independence = director.verification_status === 'verified' ? 'independent' : 'non-independent'
  biography += `${name} qualifies as ${independence} under applicable standards. `

  // Conclude with contribution summary
  biography += `We believe ${name} is well-qualified to serve on our board based on ${name}'s extensive experience, industry knowledge, and track record of board service and corporate governance expertise.`

  return biography
}

function generateSecEdgarHtml(company: CompanyData, directors: DirectorData[]): string {
  let html = ''

  html += '<!DOCTYPE html>\n<html>\n<head>\n'
  html += `<title>${company.name} - Director and Executive Officer Information</title>\n`
  html += '<meta charset="utf-8">\n'
  html += '</head>\n<body>\n'

  // Title and introduction
  html += '<h1>Director, Executive Officer, and Significant Employee Information</h1>\n'
  html += `<p><strong>Company:</strong> ${company.name}</p>\n`
  if (company.ipo_date) {
    html += `<p><strong>IPO Date:</strong> ${company.ipo_date}</p>\n`
  }
  html += `<p><strong>Date of Filing:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>\n`
  html += '<hr>\n'

  // Directors section
  html += '<h2>Directors and Executive Officers</h2>\n'

  for (const director of directors) {
    html += '<div style="page-break-inside: avoid; margin-bottom: 2em;">\n'
    html += `<h3>${director.name}</h3>\n`
    html += `<p><strong>Title:</strong> ${director.professional_title}</p>\n`
    html += `<p><strong>Years of Experience:</strong> ${director.years_of_experience || 'Not specified'}</p>\n`
    html += `<p><strong>Independence Status:</strong> ${director.verification_status === 'verified' ? 'Independent' : 'Non-Independent'}</p>\n`

    // Education
    html += '<h4>Education</h4>\n'
    if (director.certifications && director.certifications.length > 0) {
      html += '<ul>\n'
      for (const cert of director.certifications) {
        html += `<li>${cert}</li>\n`
      }
      html += '</ul>\n'
    } else {
      html += '<p>Education details available upon request.</p>\n'
    }

    // Experience and Expertise
    html += '<h4>Experience and Expertise</h4>\n'
    html += `<p>${formatSecEdgarBiography(director)}</p>\n`

    // Committee Memberships
    if (director.past_board_positions && Array.isArray(director.past_board_positions) && director.past_board_positions.length > 0) {
      html += '<h4>Committee Memberships</h4>\n'
      html += '<ul>\n'
      for (const position of director.past_board_positions) {
        if (position.company) {
          html += `<li><strong>${position.title || 'Board Member'}</strong> - ${position.company}${position.years ? ` (${position.years} years)` : ''}</li>\n`
        }
      }
      html += '</ul>\n'
    }

    // Corporate Governance Expertise
    html += '<h4>Corporate Governance Expertise</h4>\n'
    html += `<p>${director.name} brings significant expertise in corporate governance matters to our board. `
    html += `Based on ${director.name}'s background and experience, we believe ${director.name} is well-qualified to serve on our board of directors.</p>\n`

    html += '</div>\n'
    html += '<hr>\n'
  }

  // Executive Compensation Summary
  html += '<h2>Executive Compensation</h2>\n'
  html += '<p>Executive compensation information is disclosed in accordance with applicable Securities and Exchange Commission rules and regulations.</p>\n'

  // Corporate Governance
  html += '<h2>Corporate Governance</h2>\n'
  html += `<p>${company.name} is committed to the highest standards of corporate governance. Our board of directors is composed of individuals with diverse skills, backgrounds, and perspectives, including expertise in various industries, finance, operations, and strategic planning.</p>\n`

  html += '</body>\n</html>'

  return html
}

function generateSecEdgarText(company: CompanyData, directors: DirectorData[]): string {
  let text = ''

  text += 'Director, Executive Officer, and Significant Employee Information\n'
  text += '='.repeat(80) + '\n\n'
  text += `Company: ${company.name}\n`
  text += `Filing Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
  if (company.ipo_date) {
    text += `IPO Date: ${company.ipo_date}\n`
  }
  text += '\n' + '='.repeat(80) + '\n\n'

  for (const director of directors) {
    text += `${director.name}\n`
    text += '-'.repeat(director.name.length) + '\n'
    text += `Title: ${director.professional_title}\n`
    text += `Years of Experience: ${director.years_of_experience || 'Not specified'}\n`
    text += `Independence Status: ${director.verification_status === 'verified' ? 'Independent' : 'Non-Independent'}\n`
    text += '\nEducation and Professional Designations:\n'

    if (director.certifications && director.certifications.length > 0) {
      for (const cert of director.certifications) {
        text += `  - ${cert}\n`
      }
    } else {
      text += '  Education details available upon request.\n'
    }

    text += '\nExperience and Expertise:\n'
    text += formatSecEdgarBiography(director) + '\n'

    if (director.past_board_positions && Array.isArray(director.past_board_positions) && director.past_board_positions.length > 0) {
      text += '\nCommittee Memberships and Board Service:\n'
      for (const position of director.past_board_positions) {
        if (position.company) {
          text += `  - ${position.title || 'Board Member'} at ${position.company}${position.years ? ` (${position.years} years)` : ''}\n`
        }
      }
    }

    text += '\nCorporate Governance Expertise:\n'
    text += `${director.name} brings significant expertise in corporate governance matters to our board. `
    text += `Based on ${director.name}'s background and experience, we believe ${director.name} is well-qualified to serve on our board of directors.\n`

    text += '\n' + '-'.repeat(80) + '\n\n'
  }

  text += 'Executive Compensation\n'
  text += '='.repeat(80) + '\n'
  text += 'Executive compensation information is disclosed in accordance with applicable Securities and Exchange Commission rules and regulations.\n\n'

  text += 'Corporate Governance\n'
  text += '='.repeat(80) + '\n'
  text += `${company.name} is committed to the highest standards of corporate governance. Our board of directors is composed of individuals with diverse skills, backgrounds, and perspectives, including expertise in various industries, finance, operations, and strategic planning.\n`

  return text
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; companyId?: string } | undefined

  if (!session || !user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { directorIds, format = 'html' } = body

    // Validate input
    if (!Array.isArray(directorIds) || directorIds.length === 0) {
      return NextResponse.json(
        { error: 'directorIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!['html', 'text'].includes(format)) {
      return NextResponse.json(
        { error: 'format must be either "html" or "text"' },
        { status: 400 }
      )
    }

    // Fetch company info
    const companyRows = await sql`
      SELECT id, name, ipo_date
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
        verification_status,
        industries
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

    // Generate SEC Edgar content
    let content: string
    if (format === 'html') {
      content = generateSecEdgarHtml(company, directorRows)
    } else {
      content = generateSecEdgarText(company, directorRows)
    }

    return NextResponse.json({
      format,
      content,
      generatedAt: new Date().toISOString(),
      directorCount: directorRows.length,
      companyInfo: {
        name: company.name,
        ipoDate: company.ipo_date,
      },
    })
  } catch (error) {
    console.error('Error generating SEC Edgar export:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEC Edgar export' },
      { status: 500 }
    )
  }
}
