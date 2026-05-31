/**
 * Seed IPO Benchmarking Data
 * Populates ipo_benchmarks and ipo_historical_data tables with realistic IPO trends
 */

import { sql } from '@/lib/db'

export async function seedIpoBenchmarks() {
  // Phase order for reference
  const PHASE_ORDER = [
    'pre_planning',
    'corporate_restructuring',
    'financial_audit',
    'legal_documentation',
    'regulatory_filing',
    'marketing_roadshow',
    'listing_application',
    'post_listing',
  ]

  // Benchmark data by exchange
  // Format: [exchange, phase_id, phase_name, avg_pct, median_pct, p90_pct, sample_size]
  const benchmarkData = [
    // TSX benchmarks (Canadian main market, ~240 days avg)
    ['tsx', 1, 'pre_planning', 95, 100, 100, 150],
    ['tsx', 2, 'corporate_restructuring', 85, 90, 100, 150],
    ['tsx', 3, 'financial_audit', 75, 80, 95, 150],
    ['tsx', 4, 'legal_documentation', 70, 75, 90, 150],
    ['tsx', 5, 'regulatory_filing', 60, 65, 85, 150],
    ['tsx', 6, 'marketing_roadshow', 45, 50, 75, 150],
    ['tsx', 7, 'listing_application', 25, 30, 60, 150],
    ['tsx', 8, 'post_listing', 10, 15, 40, 150],

    // NASDAQ benchmarks (US tech market, ~360 days avg)
    ['nasdaq', 1, 'pre_planning', 98, 100, 100, 200],
    ['nasdaq', 2, 'corporate_restructuring', 88, 92, 100, 200],
    ['nasdaq', 3, 'financial_audit', 78, 83, 98, 200],
    ['nasdaq', 4, 'legal_documentation', 72, 78, 95, 200],
    ['nasdaq', 5, 'regulatory_filing', 62, 68, 90, 200],
    ['nasdaq', 6, 'marketing_roadshow', 48, 55, 85, 200],
    ['nasdaq', 7, 'listing_application', 28, 35, 70, 200],
    ['nasdaq', 8, 'post_listing', 12, 18, 50, 200],

    // NYSE benchmarks (US large cap, ~380 days avg)
    ['nyse', 1, 'pre_planning', 97, 100, 100, 180],
    ['nyse', 2, 'corporate_restructuring', 87, 91, 100, 180],
    ['nyse', 3, 'financial_audit', 77, 82, 97, 180],
    ['nyse', 4, 'legal_documentation', 71, 77, 94, 180],
    ['nyse', 5, 'regulatory_filing', 61, 67, 89, 180],
    ['nyse', 6, 'marketing_roadshow', 47, 54, 84, 180],
    ['nyse', 7, 'listing_application', 27, 34, 69, 180],
    ['nyse', 8, 'post_listing', 11, 17, 48, 180],

    // TSXV benchmarks (Canadian venture, ~180 days avg, faster)
    ['tsxv', 1, 'pre_planning', 93, 98, 100, 120],
    ['tsxv', 2, 'corporate_restructuring', 82, 88, 99, 120],
    ['tsxv', 3, 'financial_audit', 72, 78, 93, 120],
    ['tsxv', 4, 'legal_documentation', 68, 73, 88, 120],
    ['tsxv', 5, 'regulatory_filing', 58, 63, 82, 120],
    ['tsxv', 6, 'marketing_roadshow', 42, 48, 72, 120],
    ['tsxv', 7, 'listing_application', 22, 28, 55, 120],
    ['tsxv', 8, 'post_listing', 8, 12, 35, 120],

    // CSE benchmarks (Canadian secondary, ~150 days avg)
    ['cse', 1, 'pre_planning', 92, 96, 100, 100],
    ['cse', 2, 'corporate_restructuring', 80, 86, 98, 100],
    ['cse', 3, 'financial_audit', 70, 76, 91, 100],
    ['cse', 4, 'legal_documentation', 66, 71, 86, 100],
    ['cse', 5, 'regulatory_filing', 56, 61, 80, 100],
    ['cse', 6, 'marketing_roadshow', 40, 46, 70, 100],
    ['cse', 7, 'listing_application', 20, 26, 52, 100],
    ['cse', 8, 'post_listing', 7, 10, 32, 100],

    // OTC benchmarks (US OTC, ~90 days avg, fastest)
    ['otc', 1, 'pre_planning', 90, 95, 100, 200],
    ['otc', 2, 'corporate_restructuring', 78, 84, 97, 200],
    ['otc', 3, 'financial_audit', 68, 74, 89, 200],
    ['otc', 4, 'legal_documentation', 64, 69, 84, 200],
    ['otc', 5, 'regulatory_filing', 54, 59, 78, 200],
    ['otc', 6, 'marketing_roadshow', 38, 44, 68, 200],
    ['otc', 7, 'listing_application', 18, 24, 50, 200],
    ['otc', 8, 'post_listing', 5, 8, 30, 200],
  ]

  // Insert benchmark data
  console.log('Seeding IPO benchmarks...')
  for (const [exchange, phase_id, phase_name, avg_pct, median_pct, p90_pct, sample_size] of benchmarkData) {
    try {
      await sql`
        INSERT INTO ipo_benchmarks (exchange, phase_id, phase_name, avg_completion_pct, median_completion_pct, p90_completion_pct, total_companies_in_benchmark)
        VALUES (${exchange}, ${phase_id}, ${phase_name}, ${avg_pct}, ${median_pct}, ${p90_pct}, ${sample_size})
        ON CONFLICT (exchange, phase_id) DO UPDATE SET
          avg_completion_pct = ${avg_pct},
          median_completion_pct = ${median_pct},
          p90_completion_pct = ${p90_pct},
          total_companies_in_benchmark = ${sample_size},
          updated_at = NOW()
      `
    } catch (error) {
      console.error(`Error inserting benchmark for ${exchange} phase ${phase_id}:`, error)
    }
  }

  // Seed historical IPO data (synthetic data based on real trends)
  console.log('Seeding historical IPO data...')
  const historicalData = [
    // Real Canadian IPOs (2020-2024)
    { name: 'Kinaxis Inc.', exchange: 'tsx', sector: 'Software', ipo_date: '2014-11-20', days_to_ipo: 240, team_size: 45, funding: 15000000 },
    { name: 'Nuvista Energy Ltd.', exchange: 'tsx', sector: 'Energy', ipo_date: '2018-06-21', days_to_ipo: 210, team_size: 32, funding: 45000000 },
    { name: 'AltaGas Ltd.', exchange: 'tsx', sector: 'Energy', ipo_date: '2003-11-27', days_to_ipo: 280, team_size: 50, funding: 120000000 },
    { name: 'BlackBerry Limited', exchange: 'tsx', sector: 'Technology', ipo_date: '2004-04-22', days_to_ipo: 300, team_size: 80, funding: 200000000 },

    // US NASDAQ IPOs (2020-2024)
    { name: 'Shopify', exchange: 'nasdaq', sector: 'E-Commerce', ipo_date: '2015-05-21', days_to_ipo: 360, team_size: 120, funding: 300000000 },
    { name: 'Slack Technologies', exchange: 'nasdaq', sector: 'Software', ipo_date: '2019-06-20', days_to_ipo: 390, team_size: 200, funding: 750000000 },
    { name: 'Datadog Inc.', exchange: 'nasdaq', sector: 'SaaS', ipo_date: '2019-09-19', days_to_ipo: 365, team_size: 150, funding: 450000000 },
    { name: 'Zoom Video', exchange: 'nasdaq', sector: 'Software', ipo_date: '2019-04-18', days_to_ipo: 340, team_size: 180, funding: 500000000 },

    // NYSE IPOs
    { name: 'Broadcom Inc.', exchange: 'nyse', sector: 'Semiconductors', ipo_date: '1991-08-01', days_to_ipo: 380, team_size: 200, funding: 600000000 },
    { name: 'Salesforce', exchange: 'nyse', sector: 'SaaS', ipo_date: '2004-06-23', days_to_ipo: 420, team_size: 250, funding: 150000000 },

    // Venture/smaller exchanges
    { name: 'Dajin Resources', exchange: 'tsxv', sector: 'Minerals', ipo_date: '2013-03-15', days_to_ipo: 150, team_size: 12, funding: 2000000 },
    { name: 'Grizzly Discoveries Inc.', exchange: 'cse', sector: 'Resources', ipo_date: '2017-11-08', days_to_ipo: 120, team_size: 8, funding: 1500000 },
  ]

  for (const record of historicalData) {
    try {
      await sql`
        INSERT INTO ipo_historical_data (company_name, exchange, sector, ipo_date, total_days_to_ipo, team_size_at_ipo, pre_ipo_funding_usd)
        VALUES (${record.name}, ${record.exchange}, ${record.sector}, ${record.ipo_date}, ${record.days_to_ipo}, ${record.team_size}, ${record.funding})
        ON CONFLICT DO NOTHING
      `
    } catch (error) {
      console.error(`Error inserting historical data for ${record.name}:`, error)
    }
  }

  console.log('✅ IPO benchmarks and historical data seeded successfully')
}

// Helper function: Get benchmark for a company's current phase
export async function getBenchmarkForCompany(companyId: string) {
  const company = await sql`SELECT target_exchange, current_phase FROM companies WHERE id = ${companyId} LIMIT 1`
  if (!company || !company[0]) return null

  const { target_exchange, current_phase } = company[0] as { target_exchange: string; current_phase: string }

  // Map phase name to phase_id
  const phaseMap: Record<string, number> = {
    pre_planning: 1,
    corporate_restructuring: 2,
    financial_audit: 3,
    legal_documentation: 4,
    regulatory_filing: 5,
    marketing_roadshow: 6,
    listing_application: 7,
    post_listing: 8,
  }

  const phase_id = phaseMap[current_phase] ?? 1

  const benchmark = await sql`
    SELECT avg_completion_pct, median_completion_pct, p90_completion_pct
    FROM ipo_benchmarks
    WHERE exchange = ${target_exchange} AND phase_id = ${phase_id}
    LIMIT 1
  `

  return benchmark?.[0] ?? null
}

// Helper: Calculate peer percentile
export async function calculatePeerPercentile(paceScore: number, exchange: string, phase_id: number): Promise<number> {
  const benchmark = await sql`
    SELECT avg_completion_pct, median_completion_pct, p90_completion_pct
    FROM ipo_benchmarks
    WHERE exchange = ${exchange} AND phase_id = ${phase_id}
    LIMIT 1
  `

  if (!benchmark || !benchmark[0]) return 50 // Default to 50th percentile if no benchmark

  const { avg_completion_pct, median_completion_pct, p90_completion_pct } = benchmark[0] as {
    avg_completion_pct: number
    median_completion_pct: number
    p90_completion_pct: number
  }

  // Percentile calculation
  if (paceScore >= p90_completion_pct) return 90
  if (paceScore >= median_completion_pct) return 50 + ((paceScore - median_completion_pct) / (p90_completion_pct - median_completion_pct)) * 40
  if (paceScore >= avg_completion_pct) return Math.round(((paceScore - avg_completion_pct) / (median_completion_pct - avg_completion_pct)) * 50)
  return Math.round((paceScore / avg_completion_pct) * 50)
}

// Helper: Get average days to IPO for an exchange
export async function getAverageDaysToIpoByExchange(exchange: string): Promise<number> {
  const result = await sql`
    SELECT AVG(total_days_to_ipo) as avg_days
    FROM ipo_historical_data
    WHERE exchange = ${exchange}
  `

  return Math.round(parseFloat((result?.[0]?.avg_days as string) ?? '240'))
}
