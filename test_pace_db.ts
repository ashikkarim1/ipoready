import { sql } from '@/lib/db'

async function testPaceData() {
  console.log('=== Testing PACE Score Endpoint with Direct Database Queries ===\n');

  try {
    const companyId = '2e31b75b-813f-48bf-a03f-2b2a0da0c0a9';
    
    // Check if test company exists
    console.log('1. Test Company Data:');
    const companies = await sql`
      SELECT 
        id, name, pace_score, target_exchange, cash_runway_months, team_size,
        cfo_hired_at, board_size, auditor_selected, investor_sophistication_score,
        estimated_days_to_ipo, progress_percentage, current_phase
      FROM companies 
      WHERE id = ${companyId}
    ` as any[];

    if (companies.length === 0) {
      console.log('   ✗ Company not found');
      process.exit(1);
    }

    const company = companies[0];
    console.log('   ✓ Found company: ' + company.name);
    console.log('     PACE Score: ' + company.pace_score);
    console.log('     Exchange: ' + company.target_exchange);
    console.log('     Cash Runway: ' + company.cash_runway_months + ' months');
    console.log('     Team Size: ' + company.team_size);
    console.log('     CFO Hired: ' + (company.cfo_hired_at ? 'Yes' : 'No'));
    console.log('     Board Size: ' + company.board_size);
    console.log('     Auditor: ' + (company.auditor_selected ? 'Yes' : 'No'));
    console.log('     Investor Sophistication: ' + company.investor_sophistication_score);
    console.log('');

    // Calculate predictive score (matching the API logic)
    console.log('2. Predictive Score Calculation:');
    const cashRunwayScore = Math.min(company.cash_runway_months / 24, 1) * 100;
    const teamSizeScore = Math.min(company.team_size / 150, 1) * 100;
    const cfoScore = company.cfo_hired_at ? 100 : 0;
    const boardScore = Math.min(company.board_size / 5, 1) * 100;
    const auditorScore = company.auditor_selected ? 100 : 0;
    const investorScore = company.investor_sophistication_score || 0;

    const adjustedPaceScore = Math.round(
      (cashRunwayScore * 0.2) +
      (teamSizeScore * 0.15) +
      (cfoScore * 0.15) +
      (boardScore * 0.15) +
      (auditorScore * 0.15) +
      (investorScore * 0.2)
    );

    console.log('   Breakdown:');
    console.log('   - Cash Runway (${company.cash_runway_months}mo): ' + Math.round(cashRunwayScore) + ' × 0.2 = ' + Math.round(cashRunwayScore * 0.2));
    console.log('   - Team Size (${company.team_size}): ' + Math.round(teamSizeScore) + ' × 0.15 = ' + Math.round(teamSizeScore * 0.15));
    console.log('   - CFO Hired: ' + cfoScore + ' × 0.15 = ' + Math.round(cfoScore * 0.15));
    console.log('   - Board Size (${company.board_size}): ' + Math.round(boardScore) + ' × 0.15 = ' + Math.round(boardScore * 0.15));
    console.log('   - Auditor Selected: ' + auditorScore + ' × 0.15 = ' + Math.round(auditorScore * 0.15));
    console.log('   - Investor Sophistication: ' + Math.round(investorScore) + ' × 0.2 = ' + Math.round(investorScore * 0.2));
    console.log('   TOTAL: ' + adjustedPaceScore);
    console.log('');

    // Risk factors
    console.log('3. Risk Factor Analysis:');
    const riskFactors: string[] = [];
    if (company.cash_runway_months < 12) riskFactors.push('Low cash runway');
    if (company.team_size < 50) riskFactors.push('Small team size');
    if (!company.cfo_hired_at) riskFactors.push('CFO not yet hired');
    if (company.board_size < 3) riskFactors.push('Insufficient board size');
    if (!company.auditor_selected) riskFactors.push('Auditor not yet selected');

    if (riskFactors.length > 0) {
      riskFactors.forEach((rf, idx) => console.log('   ' + (idx + 1) + '. ' + rf));
    } else {
      console.log('   ✓ No risk factors identified');
    }
    console.log('');

    // Check documents
    console.log('4. Document Readiness:');
    const docs = await sql`
      SELECT
        phase_id,
        AVG(completion_pct)::float as completion
      FROM document_scorecards
      WHERE company_id = ${companyId}
      GROUP BY phase_id
      ORDER BY phase_id
    ` as any[];

    if (docs.length > 0) {
      const scores = docs.map((d: any) => d.completion);
      const overall = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      console.log('   ✓ Found ' + docs.length + ' phase scorecards');
      docs.forEach((d: any) => {
        console.log('     Phase ' + d.phase_id + ': ' + Math.round(d.completion) + '%');
      });
      console.log('   Overall Document Readiness: ' + overall + '%');
    } else {
      console.log('   ✗ No document scorecards found');
    }
    console.log('');

    // Check cap table
    console.log('5. Cap Table Status:');
    const capTable = await sql`
      SELECT COUNT(*) as count
      FROM cap_table_documents
      WHERE company_id = ${companyId}
    ` as any[];

    console.log('   Cap Table Documents: ' + capTable[0].count);
    console.log('');

    // Check benchmarks
    console.log('6. Benchmark Comparison:');
    const benchmarks = await sql`
      SELECT 
        COALESCE(AVG(pace_score), 0)::float as avg_pace,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pace_score), 0)::float as median_pace,
        COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY pace_score), 0)::float as p90_pace
      FROM companies
      WHERE target_exchange = ${company.target_exchange}
    ` as any[];

    const benchmark = benchmarks[0];
    console.log('   ' + company.target_exchange + ' Exchange:');
    console.log('   - Average PACE: ' + Math.round(benchmark.avg_pace));
    console.log('   - Median PACE: ' + Math.round(benchmark.median_pace));
    console.log('   - P90 PACE: ' + Math.round(benchmark.p90_pace));
    console.log('');

    console.log('=== Summary ===');
    console.log('✓ Base PACE Score: ' + company.pace_score);
    console.log('✓ Adjusted PACE Score: ' + adjustedPaceScore);
    console.log('✓ Confidence Level: ' + (adjustedPaceScore > 75 ? 'high' : adjustedPaceScore > 50 ? 'medium' : 'low'));
    console.log('✓ Test Data is Ready for API Testing');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

testPaceData();
