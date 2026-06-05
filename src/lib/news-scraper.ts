import { db } from './db'
import { NewsArticle, NewsImpact, RelevanceCheckInput, ImpactAssessmentRequest } from '@/types/briefing'
import { generateArticleSummary, assessArticleImpact } from './ai-intelligence'

/**
 * Morning Briefing News Scraper Service
 *
 * Runs on schedule to:
 * 1. Fetch articles from 20+ news sources
 * 2. Filter for relevance to IPO companies
 * 3. Summarize with AI
 * 4. Assess impact on IPO timeline/metrics
 * 5. Queue for email delivery
 */

interface ScraperConfig {
  sourceId: string
  sourceName: string
  category: string
  apiEndpoint?: string
  scrapeFunction: () => Promise<NewsArticle[]>
}

/**
 * Main scraper orchestrator
 */
export async function runMorningBriefing() {
  console.log('[Briefing] Starting morning briefing scrape cycle', new Date().toISOString())

  try {
    // Get all active news sources
    const sources = await db.query(`
      SELECT id, name, category, api_endpoint
      FROM news_sources
      WHERE is_active = true
    `)

    const scrapers: ScraperConfig[] = sources.rows.map(source => ({
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      apiEndpoint: source.api_endpoint,
      scrapeFunction: getScrapeFunction(source.name),
    }))

    let totalArticles = 0

    // Scrape each source in parallel
    const results = await Promise.allSettled(
      scrapers.map(async scraper => {
        try {
          console.log(`[Briefing] Scraping ${scraper.sourceName}...`)
          const articles = await scraper.scrapeFunction()

          // Store raw articles
          for (const article of articles) {
            await storeArticle(article, scraper.sourceId)
          }

          return {
            source: scraper.sourceName,
            count: articles.length,
            status: 'success',
          }
        } catch (error) {
          console.error(`[Briefing] Error scraping ${scraper.sourceName}:`, error)
          return {
            source: scraper.sourceName,
            count: 0,
            status: 'error',
            error: String(error),
          }
        }
      })
    )

    // Process articles for relevance and impact
    const articles = await db.query(`
      SELECT id, headline, content, url FROM news_articles
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      AND relevance_score IS NULL
      LIMIT 100
    `)

    for (const article of articles.rows) {
      try {
        // Get all companies to check relevance
        const companies = await db.query(`
          SELECT DISTINCT id, name FROM companies
          WHERE status IN ('pre-ipo', 'ipo-in-progress')
        `)

        for (const company of companies.rows) {
          await assessArticleRelevance(
            article.id,
            {
              headline: article.headline,
              content: article.content || '',
              companyInfo: {
                name: company.name,
                industry: 'SaaS', // Would fetch from company table
                competitors: [], // Would fetch from competitor_intelligence
                stage: 'pre-ipo',
              },
            },
            company.id
          )
        }
      } catch (error) {
        console.error(`[Briefing] Error processing article ${article.id}:`, error)
      }
    }

    console.log('[Briefing] Morning briefing scrape completed')
    return {
      status: 'success',
      sources: results,
      articlesProcessed: articles.rowCount,
    }
  } catch (error) {
    console.error('[Briefing] Fatal error in morning briefing:', error)
    throw error
  }
}

/**
 * Store scraped article in database
 */
async function storeArticle(article: NewsArticle, sourceId: string) {
  try {
    // Check if URL already exists
    const existing = await db.query(
      'SELECT id FROM news_articles WHERE url = $1',
      [article.url]
    )

    if (existing.rowCount > 0) {
      return // Article already scraped
    }

    await db.query(`
      INSERT INTO news_articles (
        source_id,
        headline,
        url,
        content,
        published_at,
        fetched_at,
        sentiment
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    `, [
      sourceId,
      article.headline,
      article.url,
      article.content,
      article.publishedAt || new Date(),
      'neutral',
    ])
  } catch (error) {
    console.error('Error storing article:', error)
  }
}

/**
 * Assess article relevance to a specific company
 */
async function assessArticleRelevance(
  articleId: string,
  input: RelevanceCheckInput,
  companyId: string
) {
  try {
    // Use AI to determine relevance
    const summary = await generateArticleSummary(input.headline, input.content)
    const relevanceScore = calculateRelevance(input, summary)

    // Update article with summary
    await db.query(`
      UPDATE news_articles
      SET ai_summary = $1, relevance_score = $2
      WHERE id = $3
    `, [summary, relevanceScore, articleId])

    // If relevant (> 0.5), assess impact on company
    if (relevanceScore > 0.5) {
      const article = await db.query(
        'SELECT * FROM news_articles WHERE id = $1',
        [articleId]
      )

      if (article.rowCount > 0) {
        const impact = await assessArticleImpact({
          article: article.rows[0],
          companyInfo: {
            id: companyId,
            name: input.companyInfo.name,
            stage: input.companyInfo.stage,
            metrics: {
              paceScore: 73,
              paceTarget: 85,
              monthlyRevenue: 1040000,
              arr: 12400000,
              grossMarginPct: 76,
              cashRunwayMonths: 8.4,
              churnPct: 2.1,
              capTableClarity: 95,
              governanceScore: 78,
            },
          },
        } as ImpactAssessmentRequest)

        // Store impact assessment
        await db.query(`
          INSERT INTO news_impacts (
            article_id,
            company_id,
            impact_type,
            impact_description,
            probability,
            recommended_action,
            urgency,
            related_kpis
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          articleId,
          companyId,
          impact.type,
          impact.description,
          impact.probability,
          impact.recommendedAction,
          impact.urgency,
          JSON.stringify(impact.relatedKpis),
        ])
      }
    }
  } catch (error) {
    console.error('Error assessing article relevance:', error)
  }
}

/**
 * Calculate relevance score (0-1) for article to company
 */
function calculateRelevance(input: RelevanceCheckInput, summary: string): number {
  const headline = input.headline.toLowerCase()
  const content = input.content.toLowerCase()
  const company = input.companyInfo.name.toLowerCase()
  const industry = input.companyInfo.industry.toLowerCase()

  let score = 0

  // Company name mention = high relevance
  if (headline.includes(company) || content.includes(company)) {
    score += 0.8
  }

  // Competitor mentions
  for (const competitor of input.companyInfo.competitors) {
    if (headline.includes(competitor.toLowerCase())) {
      score += 0.5
    }
  }

  // IPO-related keywords
  const ipoKeywords = ['ipo', 'sec', 'prospectus', 'listing', 'public', 'filing', 'underwriter']
  const keywordMatches = ipoKeywords.filter(
    kw => headline.includes(kw) || content.includes(kw)
  ).length

  score += Math.min(keywordMatches * 0.1, 0.5)

  // Industry relevance
  if (headline.includes(industry) || content.includes(industry)) {
    score += 0.3
  }

  // Regulatory keywords
  const regKeywords = ['sec', 'finra', 'regulation', 'compliance', 'filing']
  const regMatches = regKeywords.filter(kw => headline.includes(kw)).length
  score += Math.min(regMatches * 0.1, 0.4)

  // Normalize to 0-1 range
  return Math.min(score, 1.0)
}

/**
 * Get scrape function for each news source
 */
function getScrapeFunction(sourceName: string): () => Promise<NewsArticle[]> {
  // In production, these would actually fetch from APIs
  // For MVP, returning mock data

  return async () => {
    console.log(`[Scraper] Fetching from ${sourceName}`)

    // Mock articles - in production these come from real APIs
    return [
      {
        id: '',
        sourceId: '',
        headline: 'SEC Announces Extended Review Period for IPO Filings',
        url: `https://source.example.com/article-${Date.now()}`,
        content: 'The SEC has announced...',
        publishedAt: new Date(),
        fetchedAt: new Date(),
        relevanceScore: 0.85,
        sentiment: 'negative',
        createdAt: new Date(),
      },
    ]
  }
}

/**
 * Queue briefing for delivery at specified time
 */
export async function queueBriefingForDelivery(
  companyId: string,
  userId: string,
  emailAddress: string
) {
  try {
    const preferences = await db.query(
      'SELECT * FROM news_preferences WHERE company_id = $1',
      [companyId]
    )

    if (preferences.rowCount === 0) {
      console.warn(`No preferences found for company ${companyId}`)
      return
    }

    const prefs = preferences.rows[0]

    if (!prefs.email_enabled) {
      console.log(`Email disabled for company ${companyId}`)
      return
    }

    // Get briefing content
    const alerts = await db.query(`
      SELECT
        a.id,
        a.headline,
        a.url,
        a.ai_summary,
        ni.urgency,
        ni.recommended_action
      FROM news_articles a
      JOIN news_impacts ni ON a.id = ni.article_id
      WHERE ni.company_id = $1
        AND a.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY ni.urgency = 'immediate' DESC, a.published_at DESC
      LIMIT 20
    `, [companyId])

    if (alerts.rowCount === 0) {
      console.log(`No alerts for company ${companyId}`)
      return
    }

    // Record briefing send
    const send = await db.query(`
      INSERT INTO briefing_sends (
        company_id,
        recipient_email,
        recipient_user_id,
        articles_count,
        critical_alerts_count,
        status
      ) VALUES ($1, $2, $3, $4, $5, 'sent')
      RETURNING id
    `, [
      companyId,
      emailAddress,
      userId,
      alerts.rowCount,
      alerts.rows.filter(a => a.urgency === 'immediate').length,
    ])

    console.log(`[Briefing] Queued delivery for ${emailAddress}`)
    return send.rows[0].id
  } catch (error) {
    console.error('Error queueing briefing:', error)
  }
}
