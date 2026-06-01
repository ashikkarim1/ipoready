import { ExtractedSection, DocumentExtractionResult, PROSPECTUS_SECTIONS } from './prospectus-extractor'

export interface SectionMapping {
  prospectusSection: typeof PROSPECTUS_SECTIONS[0]
  prospectusOrder: number
  extractedSection: ExtractedSection | null
  confidence: number
  alternativeMatches: Array<{
    extractedSection: ExtractedSection
    confidence: number
  }>
  automationSuggestion: 'auto_fill' | 'review' | 'manual_entry'
  status: 'mapped' | 'partial' | 'missing'
}

export interface ProspectusMappingResult {
  documentName: string
  totalSections: number
  mappedSections: number
  partialMappings: number
  missingMappings: number
  mappings: SectionMapping[]
  overallCompletionEstimate: number // 0-100
  automationPotential: number // 0-100 (percentage of sections that can be auto-filled)
  remediationSuggestions: Array<{
    sectionName: string
    priority: 'critical' | 'high' | 'medium'
    suggestion: string
  }>
}

export function mapExtractedSectionsToProspectus(
  extractionResult: DocumentExtractionResult
): ProspectusMappingResult {
  const mappings: SectionMapping[] = []
  let mappedCount = 0
  let partialCount = 0
  let autoFillCount = 0

  // For each prospectus section, find the best matching extracted section
  PROSPECTUS_SECTIONS.forEach((prospectusSection, index) => {
    let bestMatch: ExtractedSection | null = null
    let bestConfidence = 0
    const alternativeMatches: Array<{ extractedSection: ExtractedSection; confidence: number }> = []

    // Score all extracted sections against this prospectus section
    extractionResult.extractedSections.forEach((extractedSection) => {
      // Calculate semantic similarity between section names
      const nameSimilarity = calculateStringSimilarity(
        prospectusSection.name.toLowerCase(),
        extractedSection.sectionName.toLowerCase()
      )

      // Use extracted confidence combined with name similarity
      const combinedConfidence = extractedSection.confidence * 0.6 + nameSimilarity * 0.4

      if (combinedConfidence > bestConfidence) {
        if (bestMatch) {
          alternativeMatches.push({
            extractedSection: bestMatch,
            confidence: bestConfidence,
          })
        }
        bestConfidence = combinedConfidence
        bestMatch = extractedSection
      } else if (combinedConfidence > 0.3) {
        alternativeMatches.push({
          extractedSection,
          confidence: combinedConfidence,
        })
      }
    })

    // Determine automation suggestion based on confidence
    let automationSuggestion: 'auto_fill' | 'review' | 'manual_entry'
    if (bestConfidence >= 0.75) {
      automationSuggestion = 'auto_fill'
      autoFillCount++
    } else if (bestConfidence >= 0.5) {
      automationSuggestion = 'review'
      partialCount++
    } else {
      automationSuggestion = 'manual_entry'
    }

    const status =
      bestConfidence >= 0.75 ? 'mapped' : bestConfidence >= 0.5 ? 'partial' : 'missing'
    if (status === 'mapped') {
      mappedCount++
    }

    mappings.push({
      prospectusSection,
      prospectusOrder: index + 1,
      extractedSection: bestMatch,
      confidence: bestConfidence,
      alternativeMatches: alternativeMatches.sort((a, b) => b.confidence - a.confidence),
      automationSuggestion,
      status,
    })
  })

  // Generate remediation suggestions
  const remediationSuggestions = generateRemediationSuggestions(mappings)

  const overallCompletionEstimate = Math.round((mappedCount / PROSPECTUS_SECTIONS.length) * 100)
  const automationPotential = Math.round((autoFillCount / PROSPECTUS_SECTIONS.length) * 100)

  return {
    documentName: extractionResult.documentName,
    totalSections: PROSPECTUS_SECTIONS.length,
    mappedSections: mappedCount,
    partialMappings: partialCount,
    missingMappings: PROSPECTUS_SECTIONS.length - mappedCount - partialCount,
    mappings,
    overallCompletionEstimate,
    automationPotential,
    remediationSuggestions,
  }
}

function calculateStringSimilarity(str1: string, str2: string): number {
  // Levenshtein distance based similarity
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase())
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

function generateRemediationSuggestions(
  mappings: SectionMapping[]
): ProspectusMappingResult['remediationSuggestions'] {
  const suggestions: ProspectusMappingResult['remediationSuggestions'] = []

  mappings.forEach((mapping) => {
    if (mapping.status === 'missing') {
      suggestions.push({
        sectionName: mapping.prospectusSection.name,
        priority: 'critical',
        suggestion: `Manually upload a document containing "${mapping.prospectusSection.name}" or use the template builder to create this section. This is a required prospectus section.`,
      })
    } else if (mapping.status === 'partial') {
      suggestions.push({
        sectionName: mapping.prospectusSection.name,
        priority: 'high',
        suggestion: `Review the auto-populated "${mapping.prospectusSection.name}" content. The match confidence is ${(mapping.confidence * 100).toFixed(0)}%. You may want to verify against source documents or supplement with additional details.`,
      })
    }
  })

  // Add cross-section remediation suggestions
  const riskSection = mappings.find((m) => m.prospectusSection.name === 'Risk Factors')
  const mdaSection = mappings.find((m) => m.prospectusSection.name === 'Management Discussion & Analysis')

  if (riskSection?.status === 'missing' && mdaSection?.status !== 'missing') {
    suggestions.push({
      sectionName: 'Risk Factors',
      priority: 'high',
      suggestion: 'Consider extracting key risks from your MD&A section to strengthen the Risk Factors portion.',
    })
  }

  return suggestions
}
