import { sql } from '@/db/client'

/**
 * Seed IPO benchmarking data based on historical IPO trends
 * Run once: `npm run seed:benchmarks`
 */

const BENCHMARK_DATA = {
  TSX: [
    { phase_id: 1, phase_name: 'Pre-Planning', avg: 5, median: 5, p90: 8 },
    { phase_id: 2, phase_name: 'Corporate Restructuring', avg: 15, median: 12, p90: 20 },
    { phase_id: 3, phase_name: 'Capitalization', avg: 30, median: 28, p90: 40 },
    { phase_id: 4, phase_name: 'Financial Audit', avg: 45, median: 43, p90: 55 },
    { phase_id: 5, phase_name: 'Legal & Regulatory', avg: 58, median: 60, p90: 70 },
    { phase_id: 6, phase_name: 'Marketing & Roadshow', avg: 72, median: 75, p90: 85 },
    { phase_id: 7, phase_name: 'IPO Filing', avg: 85, median: 87, p90: 95 },
    { phase_id: 8, phase_name: 'Post-IPO', avg: 100, median: 100, p90: 100 },
  ],
  NASDAQ: [
    { phase_id: 1, phase_name: 'Pre-Planning', avg: 3, median: 2, p90: 5 },
    { phase_id: 2, phase_name: 'Corporate Restructuring', avg: 12, median: 10, p90: 18 },
    { phase_id: 3, phase_name: 'Capitalization', avg: 25, median: 22, p90: 35 },
    { phase_id: 4, phase_name: 'Financial Audit', avg: 40, median: 38, p90: 52 },
    { phase_id: 5, phase_name: 'Legal & Regulatory', avg: 55, median: 57, p90: 68 },
    { phase_id: 6, phase_name: 'Marketing & Roadshow', avg: 70, median: 72, p90: 83 },
    { phase_id: 7, phase_name: 'IPO Filing', avg: 82, median: 85, p90: 93 },
    { phase_id: 8, phase_name: 'Post-IPO', avg: 100, median: 100, p90: 100 },
  ],
  NYSE: [
    { phase_id: 1, phase_name: 'Pre-Planning', avg: 4, median: 3, p90: 6 },
    { phase_id: 2, phase_name: 'Corporate Restructuring', avg: 14, median: 12, p90: 20 },
    { phase_id: 3, phase_name: 'Capitalization', avg: 28, median: 26, p90: 38 },
    { phase_id: 4, phase_name: 'Financial Audit', avg: 43, median: 41, p90: 54 },
    { phase_id: 5, phase_name: 'Legal & Regulatory', avg: 57, median: 59, p90: 70 },
    { phase_id: 6, phase_name: 'Marketing & Roadshow', avg: 71, median: 73, p90: 84 },
    { phase_id: 7, phase_name: 'IPO Filing', avg: 84, median: 86, p90: 94 },
    { phase_id: 8, phase_name: 'Post-IPO', avg: 100, median: 100, p90: 100 },
  ],
  TSXV: [
    { phase_id: 1, phase_name: 'Pre-Planning', avg: 8, median: 7, p90: 12 },
    { phase_id: 2, phase_name: 'Corporate Restructuring', avg: 20, median: 18, p90: 28 },
    { phase_id: 3, phase_name: 'Capitalization', avg: 38, median: 36, p90: 48 },
    { phase_id: 4, phase_name: 'Financial Audit', avg: 52, median: 50, p90: 62 },
    { phase_id: 5, phase_name: 'Legal & Regulatory', avg: 65, median: 67, p90: 77 },
    { phase_id: 6, phase_name: 'Marketing & Roadshow', avg: 78, median: 80, p90: 88 },
    { phase_id: 7, phase_name: 'IPO Filing', avg: 88, median: 90, p90: 96 },
    { phase_id: 8, phase_name: 'Post-IPO', avg: 100, median: 100, p90: 100 },
  ],
  CSE: [
    { phase_id: 1, phase_name: 'Pre-Planning', avg: 10, median: 9, p90: 15 },
    { phase_id: 2, phase_name: 'Corporate Restructuring', avg: 22, median: 20, p90: 30 },
    { phase_id: 3, phase_name: 'Capitalization', avg: 40, median: 38, p90: 50 },
    { phase_id: 4, phase_name: 'Financial Audit', avg: 55, median: 53, p90: 65 },
    { phase_id: 5, phase_name: 'Legal & Regulatory', avg: 68, median: 70, p90: 80 },
    { phase_id: 6, phase_name: 'Marketing & Roadshow', avg: 80, median: 82, p90: 90 },
    { phase_id: 7, phase_name: 'IPO Filing', avg: 90, median: 92, p90: 97 },
    { phase_id: 8, phase_name: 'Post-IPO', avg: 100, median: 100, p90: 100 },
  ],
  OTC: [
    { phase_id: 1, phase_name: 'Pre-Planning', avg: 12, median: 10, p90: 18 },
    { phase_id: 2, phase_name: 'Corporate Restructuring', avg: 25, median: 23, p90: 33 },
    { phase_id: 3, phase_name: 'Capitalization', avg: 42, median: 40, p90: 52 },
    { phase_id: 4, phase_name: 'Financial Audit', avg: 57, median: 55, p90: 67 },
    { phase_id: 5, phase_name: 'Legal & Regulatory', avg: 70, median: 72, p90: 82 },
    { phase_id: 6, phase_name: 'Marketing & Roadshow', avg: 82, median: 84, p90: 92 },
    { phase_id: 7, phase_name: 'IPO Filing', avg: 92, median: 94, p90: 98 },
    { phase_id: 8, phase_name: 'Post-IPO', avg: 100, median: 100, p90: 100 },
  ],
} as Record<string, Array<{ phase_id: number; phase_name: string; avg: number; median: number; p90: number }>>

const HISTORICAL_IPO_DATA = [
  // TSX examples
  { company: 'TechVenture Inc', exchange: 'TSX', sector: 'Technology', days: 240, team: 45, funding: 5000000, success: true },
  { company: 'Green Energy Corp', exchange: 'TSX', sector: 'Energy', days: 260, team: 52, funding: 8500000, success: true },
  { company: 'FinTech Solutions', exchange: 'TSX', sector: 'Financial Services', days: 220, team: 38, funding: 4200000, success: true },
  { company: 'MedBio Systems', exchange: 'TSX', sector: 'Healthcare', days: 280, team: 60, funding: 12000000, success: true },
  { company: 'Real Estate Platform', exchange: 'TSX', sector: 'Real Estate', days: 250, team: 35, funding: 3500000, success: true },
  // NASDAQ examples
  { company: 'CloudScale AI', exchange: 'NASDAQ', sector: 'Technology', days: 300, team: 80, funding: 25000000, success: true },
  { company: 'Quantum Computing Inc', exchange: 'NASDAQ', sector: 'Technology', days: 320, team: 95, funding: 35000000, success: true },
  { company: 'Biotech Innovations', exchange: 'NASDAQ', sector: 'Healthcare', days: 340, team: 120, funding: 45000000, success: true },
  { company: 'SaaS Platform Global', exchange: 'NASDAQ', sector: 'Software', days: 280, team: 70, funding: 20000000, success: true },
  { company: 'E-Commerce Giant', exchange: 'NASDAQ', sector: 'Retail', days: 310, team: 150, funding: 50000000, success: true },
  // NYSE examples
  { company: 'Industrial Manufacturing', exchange: 'NYSE', sector: 'Manufacturing', days: 350, team: 200, funding: 75000000, success: true },
  { company: 'Financial Services Hub', exchange: 'NYSE', sector: 'Finance', days: 360, team: 180, funding: 100000000, success: true },
  { company: 'Pharma Development', exchange: 'NYSE', sector: 'Pharmaceuticals', days: 380, team: 220, funding: 120000000, success: true },
  // TSXV examples
  { company: 'Junior Mining Co', exchange: 'TSXV', sector: 'Mining', days: 180, team: 25, funding: 1500000, success: true },
  { company: 'Small Tech Startup', exchange: 'TSXV', sector: 'Technology', days: 160, team: 18, funding: 900000, success: true },
  { company: 'Resource Exploration', exchange: 'TSXV', sector: 'Energy', days: 190, team: 30, funding: 2000000, success: true },
  // CSE examples
  { company: 'Cannabis Producer', exchange: 'CSE', sector: 'Cannabis', days: 140, team: 22, funding: 1200000, success: true },
  { company: 'Niche Biotech', exchange: 'CSE', sector: 'Healthcare', days: 150, team: 20, funding: 800000, success: true },
]

export async function seedIPOBenchmarks() {
  try {
    console.log('🌱 Seeding IPO benchmarks...')

    // Seed benchmarks for each exchange
    for (const [exchange, phases] of Object.entries(BENCHMARK_DATA)) {
      for (const phase of phases) {
        await sql`
          INSERT INTO ipo_benchmarks (exchange, phase_id, phase_name, avg_completion_pct, median_completion_pct, p90_completion_pct, total_companies_in_benchmark)
          VALUES (${exchange}, ${phase.phase_id}, ${phase.phase_name}, ${phase.avg}, ${phase.median}, ${phase.p90}, 50)
          ON CONFLICT (exchange, phase_id) DO UPDATE SET
            avg_completion_pct = EXCLUDED.avg_completion_pct,
            median_completion_pct = EXCLUDED.median_completion_pct,
            p90_completion_pct = EXCLUDED.p90_completion_pct,
            updated_at = NOW()
        `
      }
    }
    console.log(`✅ Seeded ${Object.keys(BENCHMARK_DATA).length} exchanges with phase benchmarks`)

    // Seed historical IPO data
    for (const ipo of HISTORICAL_IPO_DATA) {
      const phaseDurations = {
        phase_1: Math.floor(ipo.days * 0.05),
        phase_2: Math.floor(ipo.days * 0.15),
        phase_3: Math.floor(ipo.days * 0.2),
        phase_4: Math.floor(ipo.days * 0.15),
        phase_5: Math.floor(ipo.days * 0.15),
        phase_6: Math.floor(ipo.days * 0.15),
        phase_7: Math.floor(ipo.days * 0.15),
      }

      await sql`
        INSERT INTO ipo_historical_data (company_name, exchange, sector, ipo_date, total_days_to_ipo, phases_duration, team_size_at_ipo, pre_ipo_funding_usd, successful)
        VALUES (${ipo.company}, ${ipo.exchange}, ${ipo.sector}, NOW() - INTERVAL '${ipo.days} days', ${ipo.days}, ${JSON.stringify(phaseDurations)}, ${ipo.team}, ${ipo.funding}, ${ipo.success})
      `
    }
    console.log(`✅ Seeded ${HISTORICAL_IPO_DATA.length} historical IPO records`)
    console.log('🎉 IPO benchmark seeding complete!')
  } catch (error) {
    console.error('❌ Error seeding benchmarks:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedIPOBenchmarks().then(() => process.exit(0)).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
