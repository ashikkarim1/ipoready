#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  max: 20,
});

const results = {
  timestamp: new Date().toISOString(),
  tests: {},
  summary: {},
};

async function runTest(name, query, iterations = 100) {
  console.log(`\n📊 Running test: ${name}`);
  const latencies = [];
  const errors = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      const result = await pool.query(query);
      const elapsed = Date.now() - start;
      latencies.push(elapsed);
      
      if (i % 10 === 0) {
        process.stdout.write('.');
      }
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  console.log(' ✓');
  
  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const stats = {
    min: latencies.length > 0 ? latencies[0] : 0,
    max: latencies.length > 0 ? latencies[latencies.length - 1] : 0,
    avg: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    p50: latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0,
    p95: latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0,
    p99: latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0,
    errorCount: errors.length,
    errorRate: (errors.length / iterations * 100).toFixed(2) + '%',
    successCount: latencies.length,
  };
  
  results.tests[name] = stats;
  
  console.log(`  Min: ${stats.min}ms | Avg: ${stats.avg}ms | P95: ${stats.p95}ms | P99: ${stats.p99}ms`);
  console.log(`  Success: ${stats.successCount} | Errors: ${stats.errorCount} (${stats.errorRate})`);
  
  return stats;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('IPOReady Database Performance Test Suite');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // Test 1: Simple SELECT on pace_score_history
    await runTest(
      'PACE Score History Query',
      'SELECT id, company_id FROM pace_score_history LIMIT 10',
      100
    );
    
    // Test 2: Company data
    await runTest(
      'Company Data Query',
      'SELECT id, name, status FROM companies LIMIT 10',
      100
    );
    
    // Test 3: Documents query
    await runTest(
      'Documents Query',
      'SELECT id, company_id, status FROM documents LIMIT 10',
      100
    );
    
    // Test 4: Complex JOIN query
    await runTest(
      'Complex JOIN (Company + Documents)',
      `SELECT c.id, c.name, COUNT(d.id) as doc_count 
       FROM companies c 
       LEFT JOIN documents d ON c.id = d.company_id 
       GROUP BY c.id, c.name 
       LIMIT 10`,
      50
    );
    
    // Test 5: Aggregation query
    await runTest(
      'Aggregation Query',
      'SELECT COUNT(*) FROM companies',
      50
    );
    
    // Test 6: Update operation
    await runTest(
      'Update Operation',
      'UPDATE companies SET updated_at = NOW() WHERE id = (SELECT id FROM companies LIMIT 1) RETURNING id',
      30
    );
    
    // Test 7: Check table sizes
    console.log('\n📊 Table Statistics:');
    const tableStats = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `);
    
    console.log('  Top 10 tables by size:');
    tableStats.rows.forEach(row => {
      console.log(`    ${row.tablename}: ${row.size} (${row.row_count} rows)`);
    });
    
    // Check for missing indexes
    console.log('\n🔍 Checking index coverage...');
    const indexStats = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        COUNT(*) as index_count,
        SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as used_indexes
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY tablename
    `);
    
    console.log('  Index usage by table:');
    indexStats.rows.forEach(row => {
      console.log(`    ${row.tablename}: ${row.used_indexes}/${row.index_count} indexes in use`);
    });
    
    // Generate summary
    const passedTests = Object.values(results.tests).filter(t => t.errorRate === '0.00%').length;
    const passRate = ((passedTests / Object.keys(results.tests).length) * 100).toFixed(0);
    
    results.summary = {
      overall_status: passedTests === Object.keys(results.tests).length ? 'PASSED' : 'PARTIAL',
      total_tests: Object.keys(results.tests).length,
      passed_tests: passedTests,
      pass_rate: passRate + '%',
      timestamp: results.timestamp,
    };
    
    // Check performance thresholds
    console.log('\n⚡ Performance Assessment:');
    let allHealthy = true;
    Object.entries(results.tests).forEach(([name, stats]) => {
      const p95Healthy = stats.p95 < 200;
      const p99Healthy = stats.p99 < 300;
      const errorHealthy = parseFloat(stats.errorRate) < 5;
      
      const status = p95Healthy && p99Healthy && errorHealthy ? '✅' : '⚠️';
      console.log(`  ${status} ${name}: P95=${stats.p95}ms, Errors=${stats.errorRate}`);
      
      if (!p95Healthy || !p99Healthy || !errorHealthy) {
        allHealthy = false;
      }
    });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(allHealthy ? '✅ Database Performance: HEALTHY' : '⚠️  Database Performance: NEEDS OPTIMIZATION');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Save results
    const resultsPath = path.join(__dirname, 'database-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${resultsPath}`);
    
    process.exit(allHealthy ? 0 : 1);
    
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
