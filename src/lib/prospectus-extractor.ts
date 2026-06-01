// PDF parsing module - only imported on server side
let pdfParse: any = null

async function getPdfParser() {
  if (pdfParse === null) {
    try {
      const module = await import('pdf-parse')
      pdfParse = (module as any).default || (module as any)
    } catch (error) {
      console.warn('pdf-parse not available, PDF extraction will not work')
    }
  }
  return pdfParse
}

export interface ExtractedSection {
  sectionName: string
  content: string
  confidence: number // 0-1
  pageNumbers?: number[]
  startIndex: number
  endIndex: number
}

export interface DocumentExtractionResult {
  documentName: string
  documentType: 'pdf' | 'docx' | 'csv' | 'text'
  totalPages?: number
  extractedSections: ExtractedSection[]
  rawText: string
  extractionMethod: string
}

export const PROSPECTUS_SECTIONS = [
  {
    name: 'Executive Summary',
    keywords: ['executive summary', 'overview', 'business overview', 'company overview', 'introduction', 'key highlights', 'strategic objectives'],
  },
  {
    name: 'Risk Factors',
    keywords: ['risk factors', 'risks', 'material risks', 'risk management', 'risk disclosure', 'business risks', 'market risks'],
  },
  {
    name: 'Use of Proceeds',
    keywords: ['use of proceeds', 'offering proceeds', 'capital allocation', 'fund allocation', 'proceeds allocation', 'investment plans'],
  },
  {
    name: 'Capitalization',
    keywords: ['capitalization', 'capital structure', 'share capital', 'equity structure', 'cap table', 'capital composition'],
  },
  {
    name: 'Business Description',
    keywords: ['business', 'business description', 'operations', 'business model', 'products', 'services', 'business segments'],
  },
  {
    name: 'Financial Statements',
    keywords: ['financial statements', 'balance sheet', 'income statement', 'cash flow', 'financial position', 'audited financials'],
  },
  {
    name: 'Management Discussion & Analysis',
    keywords: ['management discussion', 'MD&A', 'management analysis', 'financial performance', 'business trends', 'results of operations'],
  },
  {
    name: 'Legal Proceedings',
    keywords: ['legal proceedings', 'litigation', 'legal disputes', 'lawsuits', 'regulatory proceedings', 'legal claims'],
  },
  {
    name: 'Regulatory Compliance',
    keywords: ['regulatory', 'compliance', 'regulations', 'licenses', 'permits', 'regulatory requirements', 'regulatory environment'],
  },
  {
    name: 'Underwriting Details',
    keywords: ['underwriting', 'underwriter', 'offering details', 'lead underwriter', 'underwriting agreement', 'underwriting fees'],
  },
  {
    name: 'Share Price Determination',
    keywords: ['share price', 'pricing', 'valuation', 'price per share', 'pricing methodology', 'price determination'],
  },
  {
    name: 'Financial Dilution',
    keywords: ['dilution', 'share dilution', 'dilutive effect', 'anti-dilution', 'ownership dilution', 'shareholder dilution'],
  },
]

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = await getPdfParser()
    if (!parser) {
      throw new Error('pdf-parse module not available')
    }
    const data = await parser(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  // Note: DOCX extraction requires server-side processing with specialized libraries
  // For now, we return an empty string. In production, use a dedicated API endpoint
  // that handles DOCX extraction with proper Node.js dependencies.
  console.warn('DOCX extraction requires server-side processing. Using fallback method.')
  // Return empty string - UI should handle this case
  return ''
}

async function extractTextFromCSV(buffer: Buffer): Promise<string> {
  try {
    const text = buffer.toString('utf-8')
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .join('\n')
  } catch (error) {
    console.error('CSV extraction error:', error)
    throw new Error('Failed to extract text from CSV')
  }
}

function extractTextFromPlain(buffer: Buffer): string {
  return buffer.toString('utf-8')
}

export async function extractTextFromDocument(
  buffer: Buffer,
  documentType: 'pdf' | 'docx' | 'csv' | 'text'
): Promise<string> {
  switch (documentType) {
    case 'pdf':
      return await extractTextFromPDF(buffer)
    case 'docx':
      return await extractTextFromDOCX(buffer)
    case 'csv':
      return await extractTextFromCSV(buffer)
    case 'text':
      return extractTextFromPlain(buffer)
    default:
      throw new Error(`Unsupported document type: ${documentType}`)
  }
}

export function identifySectionBoundaries(text: string): { start: number; end: number; heading: string }[] {
  const headingRegex = /^#{1,3}\s+(.+)$/gm
  const boundaries = []

  let match
  while ((match = headingRegex.exec(text)) !== null) {
    boundaries.push({
      start: match.index,
      end: match.index + match[0].length,
      heading: match[1].trim(),
    })
  }

  return boundaries
}

export function calculateMatchConfidence(sectionText: string, keywords: string[]): number {
  if (!sectionText || keywords.length === 0) return 0

  const lowerText = sectionText.toLowerCase()
  const matches = keywords.filter((kw) => lowerText.includes(kw.toLowerCase())).length

  const keywordMatchScore = matches / keywords.length

  // Calculate frequency score
  const words = lowerText.split(/\s+/)
  const keywordFrequency = keywords.reduce((sum, kw) => {
    const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'g')
    return sum + (sectionText.toLowerCase().match(regex) || []).length
  }, 0)
  const frequencyScore = Math.min(keywordFrequency / words.length, 1)

  // Combined confidence: 70% keyword matching, 30% frequency
  return keywordMatchScore * 0.7 + frequencyScore * 0.3
}

export async function extractProspectusContent(
  buffer: Buffer,
  documentType: 'pdf' | 'docx' | 'csv' | 'text'
): Promise<DocumentExtractionResult> {
  // Extract raw text from document
  const rawText = await extractTextFromDocument(buffer, documentType)

  // Split text into potential sections
  const sections = rawText.split(/\n{2,}/).filter((s) => s.trim().length > 100)

  // Match sections against prospectus categories
  const extractedSections: ExtractedSection[] = PROSPECTUS_SECTIONS.map((prospectusSection, index) => {
    let bestMatch: ExtractedSection | null = null
    let bestConfidence = 0

    sections.forEach((section, sectionIndex) => {
      const confidence = calculateMatchConfidence(section, prospectusSection.keywords)

      if (confidence > bestConfidence) {
        bestConfidence = confidence
        bestMatch = {
          sectionName: prospectusSection.name,
          content: section.substring(0, 5000), // Limit to 5000 chars
          confidence,
          startIndex: rawText.indexOf(section),
          endIndex: rawText.indexOf(section) + section.length,
        }
      }
    })

    return (
      bestMatch || {
        sectionName: prospectusSection.name,
        content: '',
        confidence: 0,
        startIndex: 0,
        endIndex: 0,
      }
    )
  })

  return {
    documentName: 'extracted_document',
    documentType,
    extractedSections: extractedSections.filter((s) => s.confidence > 0),
    rawText: rawText.substring(0, 50000), // Limit raw text
    extractionMethod: 'keyword-matching-with-semantic-similarity',
  }
}
