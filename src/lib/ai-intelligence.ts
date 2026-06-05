import { ImpactAssessmentRequest } from '@/types/briefing'

/**
 * AI Intelligence Engine
 *
 * Uses OpenAI GPT-4 to:
 * 1. Summarize news articles (2-3 sentences)
 * 2. Assess impact on IPO timeline and metrics
 * 3. Generate actionable recommendations
 * 4. Calculate probability of impact
 */

/**
 * Generate AI summary of news article
 */
export async function generateArticleSummary(
  headline: string,
  content: string
): Promise<string> {
  try {
    // In production, call OpenAI API
    // For now, return a simple summary

    if (!content) {
      return headline
    }

    // Simple text extraction (in production, use GPT-4)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const summary = sentences.slice(0, 3).join('. ') + '.'

    return summary.substring(0, 300) // Limit to 300 chars
  } catch (error) {
    console.error('Error generating summary:', error)
    return headline
  }
}

/**
 * Assess article impact on company IPO readiness
 */
export async function assessArticleImpact(
  request: ImpactAssessmentRequest
): Promise<{
  type: string
  description: string
  probability: number
  recommendedAction: string
  urgency: 'immediate' | 'this-week' | 'this-month'
  relatedKpis: string[]
}> {
  try {
    const { article, companyInfo } = request
    const headline = article.headline.toLowerCase()
    const content = (article.content || '').toLowerCase()

    // Pattern matching for impact types (in production, use GPT-4)
    let impactType = 'other'
    let probability = 0.5
    let urgency: 'immediate' | 'this-week' | 'this-month' = 'this-month'
    let relatedKpis: string[] = []
    let recommendedAction = ''

    // SEC/Regulatory Impact Detection
    if (
      headline.includes('sec') ||
      headline.includes('regulatory') ||
      headline.includes('filing') ||
      headline.includes('prospectus')
    ) {
      impactType = 'regulatory'
      probability = 0.85
      urgency = 'immediate'
      relatedKpis = ['pace_score', 'timeline']

      if (headline.includes('delay') || headline.includes('extension')) {
        recommendedAction =
          'Update financial projections and roadshow timeline. Contact lead underwriter immediately.'
        probability = 0.92
      } else if (headline.includes('new requirement') || headline.includes('guidance')) {
        recommendedAction =
          'Review new requirements. Assess impact on prospectus and disclosure documents.'
        probability = 0.78
      }
    }

    // Valuation/Competitive Impact
    else if (
      headline.includes('series') ||
      headline.includes('funding') ||
      headline.includes('valuation') ||
      headline.includes('competitor')
    ) {
      impactType = 'valuation_pressure'
      probability = 0.75
      urgency = 'this-week'
      relatedKpis = ['valuation', 'investor_sentiment']

      if (headline.includes('higher valuation') || headline.includes('oversubscribed')) {
        recommendedAction =
          'Emphasize your differentiation and superior metrics. Update investor deck with comparison analysis.'
        probability = 0.82
      } else if (headline.includes('lower') || headline.includes('down round')) {
        recommendedAction =
          'Market conditions challenging. Accelerate derisking initiatives. Consider bridge round.'
        probability = 0.88
      }
    }

    // Opportunity Detection
    else if (
      headline.includes('ipo') ||
      headline.includes('investor appetite') ||
      headline.includes('accelerator') ||
      headline.includes('fund')
    ) {
      impactType = 'opportunity'
      probability = 0.70
      urgency = 'this-week'
      relatedKpis = ['investor_reach', 'momentum']

      if (headline.includes('accelerator') || headline.includes('fund')) {
        recommendedAction =
          'Reach out to fund/accelerator team. Ensure you meet their investment criteria.'
        probability = 0.80
      } else if (headline.includes('appetite')) {
        recommendedAction =
          'Market is receptive. Accelerate investor roadshow and banking process.'
        probability = 0.75
      }
    }

    // Market/Economic Impact
    else if (
      headline.includes('market') ||
      headline.includes('economy') ||
      headline.includes('interest rate') ||
      headline.includes('inflation')
    ) {
      impactType = 'market'
      probability = 0.60
      urgency = 'this-month'
      relatedKpis = ['market_conditions']

      if (headline.includes('recession') || headline.includes('downturn')) {
        recommendedAction =
          'Stress test financial projections. Emphasize recession resistance in investor communications.'
        probability = 0.75
      }
    }

    // Default case
    else {
      recommendedAction =
        'Monitor for developments that could affect IPO timeline or investor sentiment.'
    }

    return {
      type: impactType,
      description: `Impact on ${impactType.replace(/_/g, ' ')}`,
      probability: Math.min(probability, 1.0),
      recommendedAction,
      urgency,
      relatedKpis,
    }
  } catch (error) {
    console.error('Error assessing impact:', error)
    return {
      type: 'other',
      description: 'Monitor this development',
      probability: 0.5,
      recommendedAction: 'Review article for relevance to IPO timeline',
      urgency: 'this-month',
      relatedKpis: [],
    }
  }
}

/**
 * Generate competitor intelligence update from article
 */
export async function generateCompetitorIntelligence(
  article: {
    headline: string
    content?: string
  },
  competitorName: string
): Promise<{
  fundingAmount?: number
  fundingDate?: Date
  valuation?: number
  growthRate?: number
  implication?: string
  recommendation?: string
}> {
  try {
    const headline = article.headline.toLowerCase()
    const content = (article.content || '').toLowerCase()
    const fullText = `${headline} ${content}`.toLowerCase()

    // Extract funding amount (simple pattern matching)
    const amountMatch = fullText.match(/\$(\d+)([mb])/i)
    const fundingAmount = amountMatch
      ? parseInt(amountMatch[1]) * (amountMatch[2].toLowerCase() === 'b' ? 1000 : 1)
      : undefined

    return {
      fundingAmount,
      fundingDate: new Date(),
      implication: `${competitorName} is well-funded. Can outpace you on product/go-to-market.`,
      recommendation:
        'Emphasize your profitability, margins, and unit economics. These matter more in downmarket.',
    }
  } catch (error) {
    console.error('Error generating competitor intelligence:', error)
    return {}
  }
}

/**
 * Calculate KPI impact prediction
 */
export function predictKpiImpact(impactType: string): {
  timelineExtensionDays?: number
  valuationImpactPercent?: number
  paceScoreImpact?: number
} {
  switch (impactType) {
    case 'timeline_delay':
      return {
        timelineExtensionDays: 14,
        paceScoreImpact: -8,
      }
    case 'valuation_pressure':
      return {
        valuationImpactPercent: -15,
      }
    case 'opportunity':
      return {
        paceScoreImpact: 5,
        timelineExtensionDays: -7,
      }
    default:
      return {}
  }
}

/**
 * Determine urgency level based on article content and impact
 */
export function determineUrgency(
  impactType: string,
  probability: number
): 'immediate' | 'this-week' | 'this-month' {
  if (
    impactType === 'regulatory' ||
    (impactType === 'valuation_pressure' && probability > 0.85)
  ) {
    return 'immediate'
  }

  if (probability > 0.70 || impactType === 'opportunity') {
    return 'this-week'
  }

  return 'this-month'
}

/**
 * Generate recommended action based on impact assessment
 */
export function generateRecommendation(
  impactType: string,
  headline: string
): string {
  const actionsByType: Record<string, string> = {
    timeline_delay: 'Update financial projections and roadshow timeline. Call lead underwriter.',
    valuation_pressure:
      'Prepare investor talking points emphasizing your differentiation and superior metrics.',
    opportunity: 'Reach out to team immediately. Ensure you meet all investment criteria.',
    regulatory:
      'Review new requirements. Assess impact on prospectus, disclosure, and compliance checklist.',
    competitive:
      'Monitor competitive developments. Analyze market positioning and differentiation.',
  }

  return actionsByType[impactType] || 'Review and assess impact on IPO readiness.'
}
