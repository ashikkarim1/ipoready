/**
 * Extended Benchmark Seeding with Enhanced Historical Data
 * Supplements the base seed-ipo-benchmarks.ts with 75+ synthetic IPO records
 * across all exchanges for improved PACE predictive accuracy
 */

import { sql } from '@/lib/db'

// Comprehensive dataset of 75+ synthetic IPO records covering all exchanges
const EXTENDED_HISTORICAL_DATA = [
  // TSX - Canadian Main Market (18 records)
  { name: 'TechVenture Systems', exchange: 'tsx', sector: 'Software', ipo_date: '2022-03-15', days_to_ipo: 245, team_size: 52, funding: 35000000 },
  { name: 'Maritime Resources Corp', exchange: 'tsx', sector: 'Energy', ipo_date: '2021-09-10', days_to_ipo: 230, team_size: 38, funding: 55000000 },
  { name: 'Fintech Innovations Ltd', exchange: 'tsx', sector: 'FinTech', ipo_date: '2022-07-22', days_to_ipo: 260, team_size: 65, funding: 42000000 },
  { name: 'BioMed Discovery Inc', exchange: 'tsx', sector: 'Healthcare', ipo_date: '2021-12-08', days_to_ipo: 275, team_size: 48, funding: 78000000 },
  { name: 'Green Energy Solutions', exchange: 'tsx', sector: 'Energy', ipo_date: '2022-05-18', days_to_ipo: 235, team_size: 41, funding: 62000000 },
  { name: 'Cloud Analytics Pro', exchange: 'tsx', sector: 'SaaS', ipo_date: '2023-01-12', days_to_ipo: 250, team_size: 58, funding: 48000000 },
  { name: 'Industrial Automation Inc', exchange: 'tsx', sector: 'Manufacturing', ipo_date: '2022-08-30', days_to_ipo: 240, team_size: 71, funding: 89000000 },
  { name: 'Digital Marketing Group', exchange: 'tsx', sector: 'Marketing', ipo_date: '2021-11-05', days_to_ipo: 220, team_size: 44, funding: 28000000 },
  { name: 'Cybersecurity Fortress', exchange: 'tsx', sector: 'Technology', ipo_date: '2023-02-28', days_to_ipo: 268, team_size: 56, funding: 76000000 },
  { name: 'Renewable Power Systems', exchange: 'tsx', sector: 'Energy', ipo_date: '2021-06-14', days_to_ipo: 255, team_size: 52, funding: 95000000 },
  { name: 'Healthcare IT Solutions', exchange: 'tsx', sector: 'Healthcare', ipo_date: '2022-10-21', days_to_ipo: 270, team_size: 67, funding: 54000000 },
  { name: 'Supply Chain Technologies', exchange: 'tsx', sector: 'Software', ipo_date: '2023-04-03', days_to_ipo: 245, team_size: 61, funding: 67000000 },
  { name: 'Fintech Payment Gateway', exchange: 'tsx', sector: 'FinTech', ipo_date: '2021-08-17', days_to_ipo: 235, team_size: 43, funding: 38000000 },
  { name: 'Agritech Innovations', exchange: 'tsx', sector: 'Agriculture', ipo_date: '2022-09-09', days_to_ipo: 250, team_size: 35, funding: 32000000 },
  { name: 'Enterprise Security Inc', exchange: 'tsx', sector: 'Technology', ipo_date: '2023-03-20', days_to_ipo: 260, team_size: 54, funding: 71000000 },
  { name: 'Logistics Automation Ltd', exchange: 'tsx', sector: 'Transportation', ipo_date: '2022-12-01', days_to_ipo: 238, team_size: 48, funding: 58000000 },
  { name: 'Quantum Computing Research', exchange: 'tsx', sector: 'Technology', ipo_date: '2023-05-15', days_to_ipo: 275, team_size: 72, funding: 125000000 },
  { name: 'Biotech Drug Development', exchange: 'tsx', sector: 'Pharmaceuticals', ipo_date: '2022-02-10', days_to_ipo: 290, team_size: 84, funding: 152000000 },

  // NASDAQ - US Tech Market (18 records)
  { name: 'AI Revolution Inc', exchange: 'nasdaq', sector: 'Artificial Intelligence', ipo_date: '2023-01-18', days_to_ipo: 375, team_size: 185, funding: 525000000 },
  { name: 'Cloud Infrastructure Pro', exchange: 'nasdaq', sector: 'Cloud Computing', ipo_date: '2022-09-22', days_to_ipo: 385, team_size: 210, funding: 680000000 },
  { name: 'Mobile-First SaaS', exchange: 'nasdaq', sector: 'SaaS', ipo_date: '2021-11-11', days_to_ipo: 360, team_size: 165, funding: 420000000 },
  { name: 'EdTech Platform Inc', exchange: 'nasdaq', sector: 'Education', ipo_date: '2023-03-28', days_to_ipo: 355, team_size: 142, funding: 380000000 },
  { name: 'DaaS Solutions Global', exchange: 'nasdaq', sector: 'Software', ipo_date: '2022-06-15', days_to_ipo: 370, team_size: 198, funding: 585000000 },
  { name: 'E-commerce AI Platform', exchange: 'nasdaq', sector: 'E-Commerce', ipo_date: '2023-02-08', days_to_ipo: 365, team_size: 172, funding: 495000000 },
  { name: 'DevOps Automation Inc', exchange: 'nasdaq', sector: 'Software', ipo_date: '2022-08-12', days_to_ipo: 378, team_size: 156, funding: 425000000 },
  { name: 'Blockchain Enterprise', exchange: 'nasdaq', sector: 'Blockchain', ipo_date: '2023-04-25', days_to_ipo: 390, team_size: 218, funding: 720000000 },
  { name: 'Cybersecurity AI Platform', exchange: 'nasdaq', sector: 'Cybersecurity', ipo_date: '2021-12-03', days_to_ipo: 385, team_size: 192, funding: 580000000 },
  { name: 'MarketPlace Analytics', exchange: 'nasdaq', sector: 'Analytics', ipo_date: '2022-10-07', days_to_ipo: 365, team_size: 148, funding: 350000000 },
  { name: 'API Management Services', exchange: 'nasdaq', sector: 'Software', ipo_date: '2023-05-11', days_to_ipo: 375, team_size: 164, funding: 470000000 },
  { name: 'Low-Code Development', exchange: 'nasdaq', sector: 'Software', ipo_date: '2022-07-20', days_to_ipo: 368, team_size: 175, funding: 510000000 },
  { name: 'Customer Data Platform', exchange: 'nasdaq', sector: 'SaaS', ipo_date: '2023-01-24', days_to_ipo: 358, team_size: 138, funding: 385000000 },
  { name: 'Remote Work Technologies', exchange: 'nasdaq', sector: 'Software', ipo_date: '2021-09-17', days_to_ipo: 342, team_size: 122, funding: 295000000 },
  { name: 'Quantum Computing Services', exchange: 'nasdaq', sector: 'Technology', ipo_date: '2023-06-10', days_to_ipo: 405, team_size: 245, funding: 850000000 },
  { name: 'Data Science Platform', exchange: 'nasdaq', sector: 'Analytics', ipo_date: '2022-05-18', days_to_ipo: 362, team_size: 155, funding: 405000000 },
  { name: 'Network Security Inc', exchange: 'nasdaq', sector: 'Cybersecurity', ipo_date: '2023-02-14', days_to_ipo: 382, team_size: 188, funding: 615000000 },
  { name: 'AR/VR Experience Engine', exchange: 'nasdaq', sector: 'Metaverse', ipo_date: '2022-11-09', days_to_ipo: 398, team_size: 225, funding: 745000000 },

  // NYSE - Large Cap Market (14 records)
  { name: 'Enterprise Infrastructure Inc', exchange: 'nyse', sector: 'Technology', ipo_date: '2022-04-12', days_to_ipo: 410, team_size: 285, funding: 890000000 },
  { name: 'Global Banking Solutions', exchange: 'nyse', sector: 'FinTech', ipo_date: '2023-01-30', days_to_ipo: 425, team_size: 318, funding: 1200000000 },
  { name: 'Semiconductor Manufacturing', exchange: 'nyse', sector: 'Semiconductors', ipo_date: '2022-09-05', days_to_ipo: 440, team_size: 425, funding: 1800000000 },
  { name: 'Advanced Materials Inc', exchange: 'nyse', sector: 'Materials', ipo_date: '2021-12-20', days_to_ipo: 450, team_size: 380, funding: 1450000000 },
  { name: 'Biotech Therapeutics Ltd', exchange: 'nyse', sector: 'Pharmaceuticals', ipo_date: '2022-06-28', days_to_ipo: 468, team_size: 310, funding: 2100000000 },
  { name: 'Aerospace Systems Global', exchange: 'nyse', sector: 'Aerospace', ipo_date: '2023-03-15', days_to_ipo: 445, team_size: 485, funding: 2450000000 },
  { name: 'Smart City Solutions Inc', exchange: 'nyse', sector: 'IoT', ipo_date: '2022-08-22', days_to_ipo: 432, team_size: 298, funding: 975000000 },
  { name: 'Green Chemistry Corp', exchange: 'nyse', sector: 'Chemicals', ipo_date: '2023-02-09', days_to_ipo: 428, team_size: 256, funding: 850000000 },
  { name: 'Autonomous Systems Tech', exchange: 'nyse', sector: 'Robotics', ipo_date: '2022-10-14', days_to_ipo: 458, team_size: 395, funding: 1650000000 },
  { name: 'Medical Device Innovator', exchange: 'nyse', sector: 'Medical Devices', ipo_date: '2021-11-26', days_to_ipo: 475, team_size: 340, funding: 1900000000 },
  { name: 'Energy Storage Solutions', exchange: 'nyse', sector: 'Energy', ipo_date: '2023-04-17', days_to_ipo: 440, team_size: 268, funding: 1100000000 },
  { name: 'Industrial Automation Giant', exchange: 'nyse', sector: 'Manufacturing', ipo_date: '2022-07-11', days_to_ipo: 420, team_size: 512, funding: 1950000000 },
  { name: 'Climate Tech Solutions', exchange: 'nyse', sector: 'ClimateIT', ipo_date: '2023-05-22', days_to_ipo: 435, team_size: 275, funding: 925000000 },
  { name: 'Space Technology Corp', exchange: 'nyse', sector: 'Aerospace', ipo_date: '2022-03-08', days_to_ipo: 465, team_size: 445, funding: 2800000000 },

  // TSXV - Venture Market (12 records)
  { name: 'Early Stage Biotech', exchange: 'tsxv', sector: 'Biotechnology', ipo_date: '2023-02-15', days_to_ipo: 165, team_size: 18, funding: 4500000 },
  { name: 'Small Cap Tech Startup', exchange: 'tsxv', sector: 'Software', ipo_date: '2022-08-20', days_to_ipo: 155, team_size: 15, funding: 3200000 },
  { name: 'Junior Mining Explorer', exchange: 'tsxv', sector: 'Mining', ipo_date: '2023-04-12', days_to_ipo: 140, team_size: 12, funding: 2100000 },
  { name: 'Oil & Gas Explorer Ltd', exchange: 'tsxv', sector: 'Energy', ipo_date: '2022-10-18', days_to_ipo: 175, team_size: 22, funding: 5800000 },
  { name: 'Cannabis Growing Corp', exchange: 'tsxv', sector: 'Cannabis', ipo_date: '2023-01-09', days_to_ipo: 145, team_size: 24, funding: 6200000 },
  { name: 'Lithium Extraction Tech', exchange: 'tsxv', sector: 'Mining', ipo_date: '2022-11-30', days_to_ipo: 168, team_size: 16, funding: 3800000 },
  { name: 'Startup Consulting AI', exchange: 'tsxv', sector: 'Software', ipo_date: '2023-03-22', days_to_ipo: 158, team_size: 17, funding: 2900000 },
  { name: 'Renewable Energy Pilot', exchange: 'tsxv', sector: 'Energy', ipo_date: '2022-09-05', days_to_ipo: 172, team_size: 20, funding: 5100000 },
  { name: 'Tech Innovation Lab', exchange: 'tsxv', sector: 'Technology', ipo_date: '2023-05-10', days_to_ipo: 162, team_size: 19, funding: 4300000 },
  { name: 'Medical Device Startup', exchange: 'tsxv', sector: 'Healthcare', ipo_date: '2022-12-07', days_to_ipo: 180, team_size: 21, funding: 5900000 },
  { name: 'Agricultural Tech Venture', exchange: 'tsxv', sector: 'Agriculture', ipo_date: '2023-02-28', days_to_ipo: 152, team_size: 14, funding: 2800000 },
  { name: 'Clean Energy Project', exchange: 'tsxv', sector: 'Energy', ipo_date: '2022-07-19', days_to_ipo: 165, team_size: 18, funding: 4200000 },

  // CSE - Canadian Securities Exchange (10 records)
  { name: 'Quick Growth Tech', exchange: 'cse', sector: 'Software', ipo_date: '2023-03-01', days_to_ipo: 125, team_size: 11, funding: 1800000 },
  { name: 'Micro Cap Minerals', exchange: 'cse', sector: 'Mining', ipo_date: '2022-09-14', days_to_ipo: 135, team_size: 9, funding: 1200000 },
  { name: 'Fast Track Cannabis', exchange: 'cse', sector: 'Cannabis', ipo_date: '2023-01-20', days_to_ipo: 110, team_size: 13, funding: 2400000 },
  { name: 'Penny Stock Energy', exchange: 'cse', sector: 'Energy', ipo_date: '2022-11-08', days_to_ipo: 128, team_size: 10, funding: 1650000 },
  { name: 'Venture Capital Platform', exchange: 'cse', sector: 'FinTech', ipo_date: '2023-04-25', days_to_ipo: 132, team_size: 12, funding: 2100000 },
  { name: 'Small Resource Play', exchange: 'cse', sector: 'Resources', ipo_date: '2022-10-30', days_to_ipo: 138, team_size: 8, funding: 950000 },
  { name: 'Biotech Discovery Micro', exchange: 'cse', sector: 'Biotechnology', ipo_date: '2023-02-14', days_to_ipo: 122, team_size: 10, funding: 1500000 },
  { name: 'Tech Innovation Micro', exchange: 'cse', sector: 'Technology', ipo_date: '2022-12-19', days_to_ipo: 130, team_size: 11, funding: 1950000 },
  { name: 'Exploration Company Ltd', exchange: 'cse', sector: 'Mining', ipo_date: '2023-05-03', days_to_ipo: 118, team_size: 7, funding: 1100000 },
  { name: 'Green Energy Penny Stock', exchange: 'cse', sector: 'Energy', ipo_date: '2022-08-17', days_to_ipo: 125, team_size: 9, funding: 1400000 },

  // OTC - Over the Counter US Market (10 records)
  { name: 'Micro Cap Tech US', exchange: 'otc', sector: 'Software', ipo_date: '2023-03-10', days_to_ipo: 85, team_size: 8, funding: 800000 },
  { name: 'Penny Stock Explorer', exchange: 'otc', sector: 'Mining', ipo_date: '2022-09-25', days_to_ipo: 95, team_size: 6, funding: 450000 },
  { name: 'Start-Up Biotech US', exchange: 'otc', sector: 'Biotechnology', ipo_date: '2023-02-01', days_to_ipo: 78, team_size: 7, funding: 600000 },
  { name: 'Energy Penny Play', exchange: 'otc', sector: 'Energy', ipo_date: '2022-10-11', days_to_ipo: 88, team_size: 5, funding: 350000 },
  { name: 'Quick List Tech', exchange: 'otc', sector: 'Technology', ipo_date: '2023-04-15', days_to_ipo: 92, team_size: 7, funding: 700000 },
  { name: 'Development Stage Corp', exchange: 'otc', sector: 'Resources', ipo_date: '2022-11-20', days_to_ipo: 105, team_size: 4, funding: 250000 },
  { name: 'Early Stage Health Tech', exchange: 'otc', sector: 'Healthcare', ipo_date: '2023-01-18', days_to_ipo: 82, team_size: 6, funding: 520000 },
  { name: 'Micro Software Venture', exchange: 'otc', sector: 'Software', ipo_date: '2022-12-05', days_to_ipo: 90, team_size: 7, funding: 680000 },
  { name: 'Exploration Play OTC', exchange: 'otc', sector: 'Mining', ipo_date: '2023-05-08', days_to_ipo: 75, team_size: 5, funding: 380000 },
  { name: 'Development Biotech', exchange: 'otc', sector: 'Pharmaceuticals', ipo_date: '2022-08-22', days_to_ipo: 98, team_size: 8, funding: 920000 },
]

export async function seedExtendedHistoricalData(): Promise<void> {
  console.log(`Seeding ${EXTENDED_HISTORICAL_DATA.length} additional historical IPO records...`)

  let successCount = 0
  let errorCount = 0

  for (const record of EXTENDED_HISTORICAL_DATA) {
    try {
      await sql`
        INSERT INTO ipo_historical_data (company_name, exchange, sector, ipo_date, total_days_to_ipo, team_size_at_ipo, pre_ipo_funding_usd)
        VALUES (${record.name}, ${record.exchange}, ${record.sector}, ${record.ipo_date}, ${record.days_to_ipo}, ${record.team_size}, ${record.funding})
        ON CONFLICT DO NOTHING
      `
      successCount++
    } catch (error) {
      console.error(`Error inserting historical data for ${record.name}:`, error)
      errorCount++
    }
  }

  console.log(`✅ Extended seed complete: ${successCount} records inserted, ${errorCount} errors`)
}

// Get phase duration distribution for an exchange
export async function getPhaseDistributionByExchange(exchange: string) {
  const result = await sql`
    SELECT
      exchange,
      sector,
      COUNT(*) as company_count,
      ROUND(AVG(total_days_to_ipo)::numeric) as avg_days,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_days_to_ipo)::numeric) as median_days,
      ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY total_days_to_ipo)::numeric) as p90_days,
      MIN(total_days_to_ipo) as min_days,
      MAX(total_days_to_ipo) as max_days
    FROM ipo_historical_data
    WHERE exchange = ${exchange}
    GROUP BY exchange, sector
    ORDER BY sector
  `

  return result
}

// Get success rate by exchange
export async function getSuccessRateByExchange(exchange: string): Promise<number> {
  const result = await sql`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN successful = true THEN 1 ELSE 0 END) as successful_count
    FROM ipo_historical_data
    WHERE exchange = ${exchange}
  `

  if (!result || !result[0]) return 100
  const { total, successful_count } = result[0] as { total: number; successful_count: number }
  return Math.round((successful_count / total) * 100)
}

// Get average team size at IPO by exchange
export async function getAverageTeamSizeByExchange(exchange: string): Promise<number> {
  const result = await sql`
    SELECT AVG(team_size_at_ipo) as avg_team_size
    FROM ipo_historical_data
    WHERE exchange = ${exchange}
  `

  return Math.round(parseFloat((result?.[0]?.avg_team_size as string) ?? '50'))
}

// Get funding distribution by exchange
export async function getFundingDistributionByExchange(exchange: string) {
  const result = await sql`
    SELECT
      COUNT(*) as company_count,
      MIN(pre_ipo_funding_usd) as min_funding,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY pre_ipo_funding_usd) as q1_funding,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pre_ipo_funding_usd) as median_funding,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pre_ipo_funding_usd) as q3_funding,
      MAX(pre_ipo_funding_usd) as max_funding,
      ROUND(AVG(pre_ipo_funding_usd)::numeric) as avg_funding
    FROM ipo_historical_data
    WHERE exchange = ${exchange}
  `

  return result?.[0] ?? null
}
