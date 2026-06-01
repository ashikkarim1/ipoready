import { neon } from '@neondatabase/serverless';

/**
 * Seed IPO benchmarks with synthetic historical data
 * Based on real IPO trends across different exchanges
 */

interface BenchmarkData {
  exchange: string;
  phase_id: number;
  avg_completion_pct: number;
  median_completion_pct: number;
  p90_completion_pct: number;
  total_companies_in_benchmark: number;
}

interface HistoricalIPO {
  company_name: string;
  exchange: string;
  sector: string;
  ipo_date: string;
  total_days_to_ipo: number;
  phases_duration: Record<string, number>;
  team_size_at_ipo: number;
  pre_ipo_funding_usd: number;
  successful: boolean;
}

// Synthetic benchmark data based on historical IPO trends
const BENCHMARK_DATA: BenchmarkData[] = [
  // TSX benchmarks (typical timeline: ~240 days)
  { exchange: 'TSX', phase_id: 1, avg_completion_pct: 5, median_completion_pct: 3, p90_completion_pct: 12, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 2, avg_completion_pct: 25, median_completion_pct: 20, p90_completion_pct: 45, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 3, avg_completion_pct: 45, median_completion_pct: 40, p90_completion_pct: 68, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 4, avg_completion_pct: 60, median_completion_pct: 58, p90_completion_pct: 78, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 5, avg_completion_pct: 72, median_completion_pct: 70, p90_completion_pct: 85, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 6, avg_completion_pct: 85, median_completion_pct: 83, p90_completion_pct: 92, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 7, avg_completion_pct: 92, median_completion_pct: 91, p90_completion_pct: 96, total_companies_in_benchmark: 1200 },
  { exchange: 'TSX', phase_id: 8, avg_completion_pct: 98, median_completion_pct: 99, p90_completion_pct: 100, total_companies_in_benchmark: 1200 },

  // NASDAQ benchmarks (typical timeline: ~360 days, more rigorous)
  { exchange: 'NASDAQ', phase_id: 1, avg_completion_pct: 3, median_completion_pct: 2, p90_completion_pct: 8, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 2, avg_completion_pct: 18, median_completion_pct: 15, p90_completion_pct: 35, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 3, avg_completion_pct: 38, median_completion_pct: 35, p90_completion_pct: 58, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 4, avg_completion_pct: 52, median_completion_pct: 50, p90_completion_pct: 70, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 5, avg_completion_pct: 65, median_completion_pct: 63, p90_completion_pct: 80, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 6, avg_completion_pct: 78, median_completion_pct: 76, p90_completion_pct: 88, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 7, avg_completion_pct: 88, median_completion_pct: 87, p90_completion_pct: 94, total_companies_in_benchmark: 850 },
  { exchange: 'NASDAQ', phase_id: 8, avg_completion_pct: 96, median_completion_pct: 97, p90_completion_pct: 100, total_companies_in_benchmark: 850 },

  // NYSE benchmarks (similar to NASDAQ)
  { exchange: 'NYSE', phase_id: 1, avg_completion_pct: 3, median_completion_pct: 2, p90_completion_pct: 8, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 2, avg_completion_pct: 18, median_completion_pct: 15, p90_completion_pct: 35, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 3, avg_completion_pct: 38, median_completion_pct: 35, p90_completion_pct: 58, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 4, avg_completion_pct: 52, median_completion_pct: 50, p90_completion_pct: 70, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 5, avg_completion_pct: 65, median_completion_pct: 63, p90_completion_pct: 80, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 6, avg_completion_pct: 78, median_completion_pct: 76, p90_completion_pct: 88, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 7, avg_completion_pct: 88, median_completion_pct: 87, p90_completion_pct: 94, total_companies_in_benchmark: 620 },
  { exchange: 'NYSE', phase_id: 8, avg_completion_pct: 96, median_completion_pct: 97, p90_completion_pct: 100, total_companies_in_benchmark: 620 },

  // TSXV benchmarks (venture exchange, ~180 days, faster)
  { exchange: 'TSXV', phase_id: 1, avg_completion_pct: 8, median_completion_pct: 5, p90_completion_pct: 18, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 2, avg_completion_pct: 32, median_completion_pct: 28, p90_completion_pct: 52, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 3, avg_completion_pct: 55, median_completion_pct: 52, p90_completion_pct: 75, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 4, avg_completion_pct: 70, median_completion_pct: 68, p90_completion_pct: 85, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 5, avg_completion_pct: 82, median_completion_pct: 80, p90_completion_pct: 92, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 6, avg_completion_pct: 90, median_completion_pct: 89, p90_completion_pct: 96, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 7, avg_completion_pct: 96, median_completion_pct: 96, p90_completion_pct: 99, total_companies_in_benchmark: 2100 },
  { exchange: 'TSXV', phase_id: 8, avg_completion_pct: 99, median_completion_pct: 100, p90_completion_pct: 100, total_companies_in_benchmark: 2100 },

  // CSE benchmarks (Canadian Securities Exchange, ~200 days)
  { exchange: 'CSE', phase_id: 1, avg_completion_pct: 10, median_completion_pct: 8, p90_completion_pct: 20, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 2, avg_completion_pct: 35, median_completion_pct: 32, p90_completion_pct: 55, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 3, avg_completion_pct: 58, median_completion_pct: 55, p90_completion_pct: 75, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 4, avg_completion_pct: 72, median_completion_pct: 70, p90_completion_pct: 85, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 5, avg_completion_pct: 84, median_completion_pct: 82, p90_completion_pct: 92, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 6, avg_completion_pct: 92, median_completion_pct: 91, p90_completion_pct: 97, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 7, avg_completion_pct: 97, median_completion_pct: 97, p90_completion_pct: 99, total_companies_in_benchmark: 580 },
  { exchange: 'CSE', phase_id: 8, avg_completion_pct: 99, median_completion_pct: 100, p90_completion_pct: 100, total_companies_in_benchmark: 580 },

  // OTC benchmarks (over-the-counter, ~90 days, fastest)
  { exchange: 'OTC', phase_id: 1, avg_completion_pct: 15, median_completion_pct: 12, p90_completion_pct: 28, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 2, avg_completion_pct: 45, median_completion_pct: 42, p90_completion_pct: 65, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 3, avg_completion_pct: 68, median_completion_pct: 65, p90_completion_pct: 82, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 4, avg_completion_pct: 82, median_completion_pct: 80, p90_completion_pct: 92, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 5, avg_completion_pct: 90, median_completion_pct: 89, p90_completion_pct: 97, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 6, avg_completion_pct: 96, median_completion_pct: 95, p90_completion_pct: 99, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 7, avg_completion_pct: 99, median_completion_pct: 99, p90_completion_pct: 100, total_companies_in_benchmark: 3200 },
  { exchange: 'OTC', phase_id: 8, avg_completion_pct: 100, median_completion_pct: 100, p90_completion_pct: 100, total_companies_in_benchmark: 3200 },
];

// Synthetic historical IPO data
const HISTORICAL_IPOS: HistoricalIPO[] = [
  // TSX examples
  { company_name: 'TechCore Solutions', exchange: 'TSX', sector: 'Technology', ipo_date: '2023-06-15', total_days_to_ipo: 235, phases_duration: { phase_1: 15, phase_2: 40, phase_3: 35, phase_4: 45, phase_5: 35, phase_6: 40, phase_7: 25 }, team_size_at_ipo: 52, pre_ipo_funding_usd: 8500000, successful: true },
  { company_name: 'Natural Resources Inc', exchange: 'TSX', sector: 'Energy', ipo_date: '2023-04-20', total_days_to_ipo: 248, phases_duration: { phase_1: 18, phase_2: 42, phase_3: 38, phase_4: 48, phase_5: 40, phase_6: 42, phase_7: 20 }, team_size_at_ipo: 48, pre_ipo_funding_usd: 12000000, successful: true },
  { company_name: 'FinTech Innovations', exchange: 'TSX', sector: 'Financial Services', ipo_date: '2023-08-10', total_days_to_ipo: 242, phases_duration: { phase_1: 16, phase_2: 41, phase_3: 36, phase_4: 46, phase_5: 38, phase_6: 41, phase_7: 24 }, team_size_at_ipo: 65, pre_ipo_funding_usd: 15000000, successful: true },

  // NASDAQ examples
  { company_name: 'CloudScale AI', exchange: 'NASDAQ', sector: 'Technology', ipo_date: '2023-09-22', total_days_to_ipo: 358, phases_duration: { phase_1: 20, phase_2: 45, phase_3: 55, phase_4: 70, phase_5: 60, phase_6: 65, phase_7: 43 }, team_size_at_ipo: 189, pre_ipo_funding_usd: 85000000, successful: true },
  { company_name: 'BioGenesis Corp', exchange: 'NASDAQ', sector: 'Healthcare', ipo_date: '2023-11-08', total_days_to_ipo: 372, phases_duration: { phase_1: 22, phase_2: 48, phase_3: 58, phase_4: 72, phase_5: 62, phase_6: 68, phase_7: 42 }, team_size_at_ipo: 156, pre_ipo_funding_usd: 120000000, successful: true },
  { company_name: 'SecureNet Systems', exchange: 'NASDAQ', sector: 'Cybersecurity', ipo_date: '2023-07-14', total_days_to_ipo: 365, phases_duration: { phase_1: 21, phase_2: 46, phase_3: 56, phase_4: 71, phase_5: 61, phase_6: 66, phase_7: 44 }, team_size_at_ipo: 124, pre_ipo_funding_usd: 72000000, successful: true },

  // TSXV examples
  { company_name: 'Venture Biotech', exchange: 'TSXV', sector: 'Biotechnology', ipo_date: '2023-05-30', total_days_to_ipo: 178, phases_duration: { phase_1: 12, phase_2: 28, phase_3: 30, phase_4: 35, phase_5: 28, phase_6: 30, phase_7: 15 }, team_size_at_ipo: 32, pre_ipo_funding_usd: 4200000, successful: true },
  { company_name: 'Explorex Mining', exchange: 'TSXV', sector: 'Mining', ipo_date: '2023-03-15', total_days_to_ipo: 185, phases_duration: { phase_1: 13, phase_2: 29, phase_3: 31, phase_4: 36, phase_5: 29, phase_6: 32, phase_7: 15 }, team_size_at_ipo: 28, pre_ipo_funding_usd: 3800000, successful: true },
  { company_name: 'GreenEnergy Solutions', exchange: 'TSXV', sector: 'Renewable Energy', ipo_date: '2023-07-22', total_days_to_ipo: 172, phases_duration: { phase_1: 11, phase_2: 26, phase_3: 28, phase_4: 33, phase_5: 27, phase_6: 31, phase_7: 16 }, team_size_at_ipo: 35, pre_ipo_funding_usd: 5100000, successful: true },

  // CSE examples
  { company_name: 'Cannabis Growth Co', exchange: 'CSE', sector: 'Cannabis', ipo_date: '2023-04-10', total_days_to_ipo: 195, phases_duration: { phase_1: 14, phase_2: 32, phase_3: 32, phase_4: 38, phase_5: 31, phase_6: 32, phase_7: 16 }, team_size_at_ipo: 38, pre_ipo_funding_usd: 6500000, successful: true },
  { company_name: 'Digital Commerce Inc', exchange: 'CSE', sector: 'E-commerce', ipo_date: '2023-06-05', total_days_to_ipo: 203, phases_duration: { phase_1: 15, phase_2: 33, phase_3: 34, phase_4: 40, phase_5: 32, phase_6: 33, phase_7: 16 }, team_size_at_ipo: 42, pre_ipo_funding_usd: 7200000, successful: true },

  // OTC examples
  { company_name: 'QuickGrow Tech', exchange: 'OTC', sector: 'Software', ipo_date: '2023-02-28', total_days_to_ipo: 92, phases_duration: { phase_1: 8, phase_2: 15, phase_3: 18, phase_4: 20, phase_5: 15, phase_6: 12, phase_7: 4 }, team_size_at_ipo: 18, pre_ipo_funding_usd: 1500000, successful: true },
  { company_name: 'StartupX Finance', exchange: 'OTC', sector: 'FinTech', ipo_date: '2023-08-31', total_days_to_ipo: 88, phases_duration: { phase_1: 7, phase_2: 14, phase_3: 17, phase_4: 19, phase_5: 14, phase_6: 12, phase_7: 5 }, team_size_at_ipo: 22, pre_ipo_funding_usd: 2000000, successful: true },
];

export async function seedBenchmarks() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('Starting benchmark seeding...');

  // Clear existing data
  await sql`DELETE FROM ipo_benchmarks`;
  await sql`DELETE FROM ipo_historical_data`;

  // Seed benchmarks
  for (const benchmark of BENCHMARK_DATA) {
    await sql`
      INSERT INTO ipo_benchmarks (
        exchange, phase_id, avg_completion_pct, median_completion_pct, p90_completion_pct, total_companies_in_benchmark
      ) VALUES (
        ${benchmark.exchange},
        ${benchmark.phase_id},
        ${benchmark.avg_completion_pct},
        ${benchmark.median_completion_pct},
        ${benchmark.p90_completion_pct},
        ${benchmark.total_companies_in_benchmark}
      )
    `;
  }

  console.log(`✓ Seeded ${BENCHMARK_DATA.length} benchmark records`);

  // Seed historical IPO data
  for (const ipo of HISTORICAL_IPOS) {
    await sql`
      INSERT INTO ipo_historical_data (
        company_name, exchange, sector, ipo_date, total_days_to_ipo, phases_duration, team_size_at_ipo, pre_ipo_funding_usd, successful
      ) VALUES (
        ${ipo.company_name},
        ${ipo.exchange},
        ${ipo.sector},
        ${ipo.ipo_date},
        ${ipo.total_days_to_ipo},
        ${JSON.stringify(ipo.phases_duration)},
        ${ipo.team_size_at_ipo},
        ${ipo.pre_ipo_funding_usd},
        ${ipo.successful}
      )
    `;
  }

  console.log(`✓ Seeded ${HISTORICAL_IPOS.length} historical IPO records`);
  console.log('✓ Benchmark seeding complete');
}
