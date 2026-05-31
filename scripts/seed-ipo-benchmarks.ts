import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(connectionString)

// Benchmark data by exchange and phase
const BENCHMARK_DATA = {
  tsx: {
    avgDays: 365,
    phases: [
      { id: 1, name: 'Pre-Planning', avg: 5, median: 5, p90: 10 },
      { id: 2, name: 'Corporate Restructuring', avg: 25, median: 20, p90: 45 },
      { id: 3, name: 'Financial Audit', avg: 18, median: 15, p90: 35 },
      { id: 4, name: 'Legal Documentation', avg: 18, median: 15, p90: 35 },
      { id: 5, name: 'Regulatory Filing', avg: 15, median: 12, p90: 30 },
      { id: 6, name: 'Marketing & Roadshow', avg: 10, median: 8, p90: 20 },
      { id: 7, name: 'Listing Application', avg: 10, median: 8, p90: 20 },
      { id: 8, name: 'Post-Listing', avg: 4, median: 3, p90: 10 },
    ],
  },
  nasdaq: {
    avgDays: 365,
    phases: [
      { id: 1, name: 'Pre-Planning', avg: 8, median: 5, p90: 15 },
      { id: 2, name: 'Corporate Restructuring', avg: 30, median: 25, p90: 55 },
      { id: 3, name: 'Financial Audit', avg: 20, median: 18, p90: 40 },
      { id: 4, name: 'Legal Documentation', avg: 20, median: 18, p90: 40 },
      { id: 5, name: 'Regulatory Filing', avg: 18, median: 15, p90: 35 },
      { id: 6, name: 'Marketing & Roadshow', avg: 12, median: 10, p90: 25 },
      { id: 7, name: 'Listing Application', avg: 12, median: 10, p90: 25 },
      { id: 8, name: 'Post-Listing', avg: 5, median: 4, p90: 12 },
    ],
  },
  nyse: {
    avgDays: 400,
    phases: [
      { id: 1, name: 'Pre-Planning', avg: 10, median: 8, p90: 18 },
      { id: 2, name: 'Corporate Restructuring', avg: 35, median: 30, p90: 60 },
      { id: 3, name: 'Financial Audit', avg: 22, median: 20, p90: 42 },
      { id: 4, name: 'Legal Documentation', avg: 22, median: 20, p90: 42 },
      { id: 5, name: 'Regulatory Filing', avg: 20, median: 18, p90: 38 },
      { id: 6, name: 'Marketing & Roadshow', avg: 14, median: 12, p90: 28 },
      { id: 7, name: 'Listing Application', avg: 14, median: 12, p90: 28 },
      { id: 8, name: 'Post-Listing', avg: 6, median: 5, p90: 14 },
    ],
  },
  tsxv: {
    avgDays: 240,
    phases: [
      { id: 1, name: 'Pre-Planning', avg: 3, median: 2, p90: 8 },
      { id: 2, name: 'Corporate Restructuring', avg: 18, median: 15, p90: 30 },
      { id: 3, name: 'Financial Audit', avg: 12, median: 10, p90: 25 },
      { id: 4, name: 'Legal Documentation', avg: 12, median: 10, p90: 25 },
      { id: 5, name: 'Regulatory Filing', avg: 10, median: 8, p90: 20 },
      { id: 6, name: 'Marketing & Roadshow', avg: 8, median: 6, p90: 15 },
      { id: 7, name: 'Listing Application', avg: 8, median: 6, p90: 15 },
      { id: 8, name: 'Post-Listing', avg: 3, median: 2, p90: 8 },
    ],
  },
  cse: {
    avgDays: 180,
    phases: [
      { id: 1, name: 'Pre-Planning', avg: 2, median: 1, p90: 5 },
      { id: 2, name: 'Corporate Restructuring', avg: 15, median: 12, p90: 25 },
      { id: 3, name: 'Financial Audit', avg: 10, median: 8, p90: 20 },
      { id: 4, name: 'Legal Documentation', avg: 10, median: 8, p90: 20 },
      { id: 5, name: 'Regulatory Filing', avg: 8, median: 6, p90: 16 },
      { id: 6, name: 'Marketing & Roadshow', avg: 6, median: 5, p90: 12 },
      { id: 7, name: 'Listing Application', avg: 6, median: 5, p90: 12 },
      { id: 8, name: 'Post-Listing', avg: 2, median: 1, p90: 5 },
    ],
  },
  otc: {
    avgDays: 120,
    phases: [
      { id: 1, name: 'Pre-Planning', avg: 1, median: 1, p90: 3 },
      { id: 2, name: 'Corporate Restructuring', avg: 8, median: 6, p90: 15 },
      { id: 3, name: 'Financial Audit', avg: 6, median: 5, p90: 12 },
      { id: 4, name: 'Legal Documentation', avg: 6, median: 5, p90: 12 },
      { id: 5, name: 'Regulatory Filing', avg: 5, median: 4, p90: 10 },
      { id: 6, name: 'Marketing & Roadshow', avg: 4, median: 3, p90: 8 },
      { id: 7, name: 'Listing Application', avg: 4, median: 3, p90: 8 },
      { id: 8, name: 'Post-Listing', avg: 1, median: 1, p90: 3 },
    ],
  },
}

async function seedBenchmarks() {
  console.log('🌱 Seeding IPO benchmarks...')

  try {
    for (const [exchange, data] of Object.entries(BENCHMARK_DATA)) {
      for (const phase of data.phases) {
        await sql`
          INSERT INTO ipo_benchmarks 
          (exchange, phase_id, avg_completion_pct, median_completion_pct, p90_completion_pct, total_companies_in_benchmark, created_at)
          VALUES (${exchange.toUpperCase()}, ${phase.id}, ${phase.avg}, ${phase.median}, ${phase.p90}, 100, NOW())
          ON CONFLICT DO NOTHING
        `
      }
    }

    console.log('✅ IPO benchmarks seeded successfully')

    // Verify
    const result = await sql`
      SELECT COUNT(*) as count FROM ipo_benchmarks
    `
    console.log(`📊 Total benchmark records: ${(result[0] as any).count}`)
  } catch (error) {
    console.error('❌ Failed to seed benchmarks:', error)
    throw error
  }
}

async function seedHistoricalData() {
  console.log('📚 Seeding historical IPO data...')

  const historicalRecords = [
    // TSX IPOs
    {
      name: 'TechCorp Canada Inc',
      exchange: 'TSX',
      sector: 'Technology',
      ipo_date: '2023-06-15',
      days_to_ipo: 365,
      team_size: 45,
      funding: 25000000,
      successful: true,
    },
    {
      name: 'Green Energy Solutions',
      exchange: 'TSX',
      sector: 'Clean Energy',
      ipo_date: '2023-09-22',
      days_to_ipo: 340,
      team_size: 38,
      funding: 18500000,
      successful: true,
    },
    {
      name: 'FinTech Innovations',
      exchange: 'TSX',
      sector: 'Financial Services',
      ipo_date: '2023-11-10',
      days_to_ipo: 385,
      team_size: 52,
      funding: 32000000,
      successful: true,
    },
    // NASDAQ IPOs
    {
      name: 'AI Solutions Global',
      exchange: 'NASDAQ',
      sector: 'Artificial Intelligence',
      ipo_date: '2023-08-30',
      days_to_ipo: 380,
      team_size: 67,
      funding: 55000000,
      successful: true,
    },
    {
      name: 'CloudSync Technologies',
      exchange: 'NASDAQ',
      sector: 'Cloud Computing',
      ipo_date: '2023-10-12',
      days_to_ipo: 365,
      team_size: 58,
      funding: 42000000,
      successful: true,
    },
    // TSXV IPOs
    {
      name: 'Emerging Biotech Inc',
      exchange: 'TSXV',
      sector: 'Biotechnology',
      ipo_date: '2023-07-20',
      days_to_ipo: 240,
      team_size: 28,
      funding: 12000000,
      successful: true,
    },
    {
      name: 'Mining Resources Ltd',
      exchange: 'TSXV',
      sector: 'Mining',
      ipo_date: '2023-09-05',
      days_to_ipo: 260,
      team_size: 32,
      funding: 15000000,
      successful: true,
    },
    // CSE IPOs
    {
      name: 'Cannabis Wellness Co',
      exchange: 'CSE',
      sector: 'Cannabis',
      ipo_date: '2023-08-15',
      days_to_ipo: 180,
      team_size: 22,
      funding: 8000000,
      successful: true,
    },
  ]

  try {
    for (const record of historicalRecords) {
      await sql`
        INSERT INTO ipo_historical_data 
        (company_name, exchange, sector, ipo_date, total_days_to_ipo, team_size_at_ipo, pre_ipo_funding_usd, successful, created_at)
        VALUES (${record.name}, ${record.exchange}, ${record.sector}, ${record.ipo_date}, ${record.days_to_ipo}, ${record.team_size}, ${record.funding}, ${record.successful}, NOW())
        ON CONFLICT DO NOTHING
      `
    }

    console.log('✅ Historical IPO data seeded successfully')

    // Verify
    const result = await sql`
      SELECT COUNT(*) as count FROM ipo_historical_data
    `
    console.log(`📚 Total historical records: ${(result[0] as any).count}`)
  } catch (error) {
    console.error('❌ Failed to seed historical data:', error)
    throw error
  }
}

async function main() {
  try {
    await seedBenchmarks()
    await seedHistoricalData()
    console.log('\n✅ All seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

main()
