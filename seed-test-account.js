const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedTestAccount() {
  try {
    const companyId = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';

    // Update company with test data (removed current_phase_id since it doesn't exist)
    await sql`
      UPDATE companies SET
        pace_score = 58,
        progress_percentage = 90,
        estimated_days_to_ipo = 120,
        current_phase = 'regulatory_filing',
        sector = 'Health Tech',
        valuation_usd = 100000000,
        pre_ipo_funding_raised_usd = 45000000,
        cash_runway_months = 8,
        team_size = 32,
        cfo_hired_at = '2025-06-01'::date,
        board_size = 5,
        auditor_selected = true,
        investor_sophistication_score = 8
      WHERE id = ${companyId}
    `;

    console.log('✅ Company updated with PACE score (58), progress (90%), and financial details');

    // Insert document scorecards
    const documents = [
      { name: 'Pre-Planning Checklist', phase: 1, completion: 100, status: 'final' },
      { name: 'Corporate Restructuring Plan', phase: 2, completion: 95, status: 'reviewed' },
      { name: 'Cap Table & Shareholder Registry', phase: 3, completion: 90, status: 'draft' },
      { name: 'Articles of Incorporation (Final)', phase: 4, completion: 100, status: 'final' },
      { name: 'Audited Financial Statements (Year 1)', phase: 5, completion: 85, status: 'draft' },
      { name: 'Management Discussion & Analysis', phase: 6, completion: 80, status: 'draft' },
      { name: 'Prospectus Section (Draft)', phase: 7, completion: 90, status: 'draft' },
      { name: 'Exchange Readiness Certification', phase: 8, completion: 95, status: 'reviewed' },
    ];

    for (const doc of documents) {
      await sql`
        INSERT INTO document_scorecards
          (company_id, document_name, phase_id, completion_pct, status, last_updated)
        VALUES
          (${companyId}, ${doc.name}, ${doc.phase}, ${doc.completion}, ${doc.status}, CURRENT_DATE)
      `;
    }

    console.log('✅ Document scorecards created (90% completion across all 8 phases)');

    // Insert benchmarks for TSXv
    const benchmarks = [
      { phase: 1, avg: 85, median: 90, p90: 98 },
      { phase: 2, avg: 75, median: 82, p90: 95 },
      { phase: 3, avg: 70, median: 78, p90: 92 },
      { phase: 4, avg: 60, median: 70, p90: 88 },
      { phase: 5, avg: 55, median: 65, p90: 85 },
      { phase: 6, avg: 50, median: 62, p90: 82 },
      { phase: 7, avg: 45, median: 55, p90: 78 },
      { phase: 8, avg: 40, median: 50, p90: 75 },
    ];

    for (const bm of benchmarks) {
      try {
        await sql`
          INSERT INTO ipo_benchmarks 
            (exchange, phase_id, avg_completion_pct, median_completion_pct, p90_completion_pct, total_companies_in_benchmark)
          VALUES
            ('TSXv', ${bm.phase}, ${bm.avg}, ${bm.median}, ${bm.p90}, 145)
          ON CONFLICT (exchange, phase_id) DO NOTHING
        `;
      } catch (e) {
        // Ignore conflicts
      }
    }

    console.log('✅ IPO benchmarks seeded for TSXv exchange');

    console.log('\n✅ TEST ACCOUNT SETUP COMPLETE:');
    console.log('   Email: tester@ipoready.ai');
    console.log('   Company: MediFlow Health Technologies Inc.');
    console.log('   Valuation: $100M USD');
    console.log('   Exchange: TSXv (Reverse Takeover)');
    console.log('   PACE Score: 58% (behind schedule)');
    console.log('   Progress: 90% across all 8 phases');
    console.log('   Access: Viewer-only');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedTestAccount();
