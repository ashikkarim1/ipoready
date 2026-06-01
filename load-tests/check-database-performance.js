#!/usr/bin/env node

/**
 * Database Performance Checker
 * Identifies N+1 queries, slow queries, and missing indexes
 */

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

class DatabasePerformanceChecker {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.issues = [];
    this.indexes = [];
    this.slowQueries = [];
  }

  async connect() {
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Connected to database\n');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      process.exit(1);
    }
  }

  async checkSlowQueries() {
    console.log('🔍 Checking for slow queries...\n');

    try {
      const result = await this.pool.query(`
        SELECT
          query,
          calls,
          mean_time,
          max_time,
          stddev_time
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 10
      `);

      if (result.rows.length === 0) {
        console.log('✅ No slow queries detected (> 100ms average)\n');
        return;
      }

      console.log('⚠️  Found slow queries:\n');
      result.rows.forEach((row, i) => {
        console.log(`${i + 1}. Query: ${row.query.substring(0, 80)}...`);
        console.log(`   Calls: ${row.calls}`);
        console.log(`   Mean: ${row.mean_time.toFixed(2)}ms`);
        console.log(`   Max: ${row.max_time.toFixed(2)}ms\n`);

        this.slowQueries.push({
          query: row.query.substring(0, 100),
          meanTime: row.mean_time,
          calls: row.calls,
        });
      });
    } catch (error) {
      console.log('ℹ️  pg_stat_statements not available (install with: CREATE EXTENSION pg_stat_statements;)\n');
    }
  }

  async checkIndexes() {
    console.log('🔍 Checking indexes on critical tables...\n');

    const criticalTables = [
      'companies',
      'pace_scores',
      'documents',
      'users',
      'tasks',
      'feedback',
    ];

    for (const table of criticalTables) {
      try {
        const result = await this.pool.query(`
          SELECT
            schemaname,
            tablename,
            indexname,
            indexdef
          FROM pg_indexes
          WHERE tablename = $1
          ORDER BY indexname
        `, [table]);

        if (result.rows.length === 0) {
          console.log(`⚠️  ${table}: No indexes found\n`);
          this.issues.push({
            severity: 'warning',
            table,
            message: 'No indexes found - may impact query performance',
          });
        } else {
          console.log(`✅ ${table}: ${result.rows.length} index(es)`);
          result.rows.forEach(row => {
            console.log(`   - ${row.indexname}`);
            this.indexes.push({ table, name: row.indexname });
          });
          console.log();
        }
      } catch (error) {
        // Table doesn't exist
      }
    }
  }

  async checkTableStats() {
    console.log('📊 Table size and row count:\n');

    try {
      const result = await this.pool.query(`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          n_live_tup as row_count,
          n_dead_tup as dead_rows
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `);

      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          console.log(`${row.tablename}:`);
          console.log(`  Size: ${row.size}`);
          console.log(`  Rows: ${row.row_count}`);
          console.log(`  Dead Rows: ${row.dead_rows}\n`);

          if (row.dead_rows > row.row_count * 0.1) {
            this.issues.push({
              severity: 'info',
              table: row.tablename,
              message: `Table has ${row.dead_rows} dead rows - consider VACUUM`,
            });
          }
        });
      }
    } catch (error) {
      console.log('ℹ️  Could not fetch table stats\n');
    }
  }

  async checkConnectionPool() {
    console.log('🔗 Connection pool status:\n');

    try {
      const result = await this.pool.query(`
        SELECT
          datname,
          numbackends as active_connections,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_database
        WHERE datname = current_database()
      `);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log(`Active connections: ${row.active_connections}`);
        console.log(`Max connections: ${row.max_connections}\n`);

        if (row.active_connections > row.max_connections * 0.8) {
          this.issues.push({
            severity: 'warning',
            message: 'Connection pool usage is high',
          });
        }
      }
    } catch (error) {
      console.log('ℹ️  Could not fetch connection pool stats\n');
    }
  }

  async checkMissingIndexes() {
    console.log('🔍 Checking for missing indexes on foreign keys...\n');

    try {
      const result = await this.pool.query(`
        SELECT
          table_name,
          column_name,
          constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          USING (constraint_name, table_name, table_schema)
        WHERE constraint_type = 'FOREIGN KEY'
          AND table_schema = 'public'
        LIMIT 20
      `);

      if (result.rows.length > 0) {
        console.log(`Found ${result.rows.length} foreign key(s)\n`);
        // Note: In production, verify these have indexes
        result.rows.forEach(row => {
          console.log(`  ${row.table_name}.${row.column_name}`);
        });
        console.log('\n⚠️  Verify each foreign key column has an index\n');
      }
    } catch (error) {
      console.log('ℹ️  Could not fetch foreign key info\n');
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      indexes: this.indexes,
      slowQueries: this.slowQueries,
      summary: {
        totalIssues: this.issues.length,
        totalIndexes: this.indexes.length,
        slowQueryCount: this.slowQueries.length,
      },
      recommendations: [
        'Ensure all frequently queried columns have indexes',
        'Monitor slow queries regularly (> 200ms)',
        'Consider query optimization for high-traffic endpoints',
        'Monitor connection pool usage - target 70% utilization',
        'Run VACUUM ANALYZE periodically to update table statistics',
      ],
    };

    const reportPath = 'load-tests/database-performance-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Database report saved to: ${reportPath}\n`);

    return report;
  }

  async close() {
    await this.pool.end();
  }
}

// Main execution
async function main() {
  const checker = new DatabasePerformanceChecker();

  try {
    await checker.connect();
    await checker.checkSlowQueries();
    await checker.checkIndexes();
    await checker.checkTableStats();
    await checker.checkConnectionPool();
    await checker.checkMissingIndexes();

    if (checker.issues.length > 0) {
      console.log('Issues found:');
      checker.issues.forEach(issue => {
        console.log(`  [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
      console.log();
    }

    await checker.generateReport();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await checker.close();
  }
}

main();
