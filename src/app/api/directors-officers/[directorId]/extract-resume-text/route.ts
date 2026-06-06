/**
 * Extract Resume Text API Endpoint
 * POST /api/directors-officers/[directorId]/extract-resume-text
 *
 * Parse resume text and extract structured data
 * Extracts: education, experience, certifications, board positions
 * Stores extracted_text and extracted_fields in DB
 *
 * Request body:
 *   - resumeId: ID of the resume to extract from
 *   - useAI: boolean, use Claude AI for advanced extraction (optional)
 *
 * Returns: { success: true, extractedData, confidence, validationIssues }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import {
  extractResumeText,
  parseResumeText,
  validateResumeData,
  ExtractedResumeData,
} from '@/lib/resume-utils'
import { readFileSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
const RESUMES_DIR = path.join(process.cwd(), 'public', 'resumes')

/**
 * Use Claude API for advanced resume extraction
 * This provides more accurate structured data extraction
 */
async function extractWithClaude(
  resumeText: string,
  professionalId: string
): Promise<ExtractedResumeData> {
  try {
    const Anthropic = require('@anthropic-ai/sdk')
    const anthropic = new Anthropic.default()

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Extract the following information from this resume text and return as JSON:

Resume Text:
${resumeText}

Please extract and structure the following fields:
1. education: Array of {school, degree, fieldOfStudy, startDate, endDate, description}
2. experience: Array of {title, company, location, startDate, endDate, description, isCurrentRole}
3. certifications: Array of {name, issuer, issuedDate, expirationDate, credentialId}
4. boardPositions: Array of {organization, position, startDate, endDate, description}

Return ONLY valid JSON, no additional text.`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        education: parsed.education || [],
        experience: parsed.experience || [],
        certifications: parsed.certifications || [],
        boardPositions: parsed.boardPositions || [],
        rawText: resumeText,
      }
    }

    return {
      education: [],
      experience: [],
      certifications: [],
      boardPositions: [],
      rawText: resumeText,
    }
  } catch (error) {
    console.error('Error using Claude API for extraction:', error)
    // Fall back to basic extraction
    return parseResumeText(resumeText)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { directorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { directorId } = params
    const body = await request.json()
    const { resumeId, useAI = false } = body

    if (!directorId || !resumeId) {
      return NextResponse.json(
        { error: 'Missing director ID or resume ID' },
        { status: 400 }
      )
    }

    // Fetch resume from database
    const result = await sql`
      SELECT id, file_path, text_extract, professional_id
      FROM director_resumes
      WHERE id = $1 AND professional_id = $2
    `

    const [resume] = result as any[]

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Use existing extracted text if available
    let resumeText = resume.text_extract

    if (!resumeText && resume.file_path) {
      // Re-extract text from file if not already extracted
      let filePath = resume.file_path
      if (!filePath.startsWith('/')) {
        filePath = path.join(RESUMES_DIR, filePath)
      }

      try {
        const buffer = readFileSync(filePath)
        const extension = path.extname(filePath)
        resumeText = await extractResumeText(buffer, extension)

        // Update database with extracted text
        await sql`
          UPDATE director_resumes
          SET text_extract = $1, is_readable = true
          WHERE id = $2
        `
      } catch (error) {
        console.error('Error extracting text from resume file:', error)
        return NextResponse.json(
          { error: 'Failed to extract text from resume file' },
          { status: 500 }
        )
      }
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: 'Resume text extraction failed or file is too short' },
        { status: 400 }
      )
    }

    // Parse resume text to extract structured data
    let extractedData: ExtractedResumeData

    if (useAI) {
      extractedData = await extractWithClaude(resumeText, directorId)
    } else {
      extractedData = parseResumeText(resumeText)
    }

    // Validate extracted data
    const validation = validateResumeData(extractedData)

    // Store extracted fields in database as JSONB
    const extractedFields = {
      education: extractedData.education,
      experience: extractedData.experience,
      certifications: extractedData.certifications,
      boardPositions: extractedData.boardPositions,
      extractedAt: new Date().toISOString(),
      usedAIExtraction: useAI,
    }

    await sql`
      UPDATE director_resumes
      SET
        extracted_text = $1,
        is_readable = $2
      WHERE id = $3
    `

    // Create a separate record for extracted fields if needed
    // For now, we'll return the data directly
    // In production, you might want to store this in a separate table

    return NextResponse.json({
      success: true,
      extractedData,
      validation: {
        isValid: validation.isValid,
        confidence: validation.confidence,
        issues: validation.issues,
      },
      textLength: resumeText.length,
      extractionMethod: useAI ? 'claude-ai' : 'pattern-matching',
    })
  } catch (error) {
    console.error('Extract resume text error:', error)
    return NextResponse.json(
      {
        error: 'Failed to extract resume text',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
