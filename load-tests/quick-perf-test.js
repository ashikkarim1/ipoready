#!/usr/bin/env node
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  max: 5,
});

async function runQuickTest() {
  console.log('🚀 IPOReady Database Performance Audit\n');
  
  try {
    // Test 1: Basic query performance
    console.log('1. Testing basic query performance...');
    const start1 = Date.now();
    const companies = await pool.query('SELECT id, name FROM companies LIMIT 5');
    const time1 = Date.now() - start1;
    console.log(`   ✓ Companies query: ${time1}ms`);
    
    // Test 2: JOIN query
    console.log('\n2. Testing JOIN query performance...');
    const start2 = Date.now();
    const joined = await pool.query(`
      SELECT c.id, c.name, COUNT(d.id) as docs
      FROM companies c
      LEFT JOIN documents d ON c.id = d.company_id
      GROUP BY c.id, c.name
      LIMIT 5
    `);
    const time2 = Date.now() - start2;
    console.log(`   ✓ JOIN query: ${time2}ms`);
    
    // Test 3: Check for slow tables
    console.log('\n3. Checking table sizes and indexes...');
    const tables = await pool.query(`
      SELECT 
        schemaname,
        relname as tablename,
        n_live_tup::text as rows,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as size
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC
      LIMIT 5
    `);
    
    console.log('\n   Top tables by size:');
    tables.rows.forEach(row => {
      console.log(`     • ${row.tablename}: ${row.rows} rows, ${row.size}`);
    });
    
    // Test 4: Check index usage
    console.log('\n4. Analyzing index efficiency...');
    const indexes = await pool.query(`
      SELECT 
        t.relname as tablename,
        COUNT(i.*) as total_indexes,
        SUM(CASE WHEN i.idx_scan = 0 THEN 1 ELSE 0 END) as unused_indexes
      FROM pg_stat_user_indexes i
      JOIN pg_class t ON i.relid = t.oid
      WHERE i.schemaname = 'public'
      GROUP BY t.relname
      HAVING COUNT(i.*) > 0
      ORDER BY t.relname
    `);
    
    let unusedCount = 0;
    indexes.rows.forEach(row => {
      const unused = row.unused_indexes || 0;
      unusedCount += unused;
      if (unused > 0) {
        console.log(`   ⚠️  ${row.tablename}: ${unused}/${row.total_indexes} indexes unused`);
      }
    });
    
    if (unusedCount === 0) {
      console.log('   ✓ All indexes are being used');
    }
    
    // Test 5: Connection pool stats
    console.log('\n5. Database connection health...');
    const connStats = await pool.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    
    const conn = connStats.rows[0];
    console.log(`   Total connections: ${conn.total_connections}`);
    console.log(`   Active: ${conn.active} | Idle: ${conn.idle} | Idle in transaction: ${conn.idle_in_transaction}`);
    
    // Summary
    console.log('\n═════════════════════════════════════════');
    console.log('📊 Performance Summary');
    console.log('═════════════════════════════════════════');
    
    const dbHealthy = time1 < 500 && time2 < 500;
    console.log(`Query Performance: ${dbHealthy ? '✅ ACCEPTABLE' : '⚠️  NEEDS OPTIMIZATION'}`);
    console.log(`  • Simple query: ${time1}ms (target: <200ms, threshold: <500ms)`);
    console.log(`  • Complex query: ${time2}ms (target: <300ms, threshold: <500ms)`);
    
    console.log(`\nIndex Coverage: ${unusedCount === 0 ? '✅ OPTIMIZED' : '⚠️  HAS UNUSED INDEXES'}`);
    console.log(`Connection Pool: ${conn.idle_in_transaction > 2 ? '⚠️  NEEDS ATTENTION' : '✅ HEALTHY'}`);
    
    console.log('\n✅ Audit Complete');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runQuickTest();
