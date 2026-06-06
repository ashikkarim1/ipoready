#!/usr/bin/env node

/**
 * Deploy all pending migrations to Neon PostgreSQL
 *
 * Runs:
 * 1. Unified Document System (002)
 * 2. Capital Markets Intelligence (003)
 *
 * Usage: node deploy-migrations.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

const MIGRATIONS_DIR = path.join(__dirname, 'src/db/migrations');

async function runMigration(filePath) {
  const fileName = path.basename(filePath);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n📦 Executing migration: ${fileName}...`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable not set');
  }

  // Use psql via environment variable
  try {
    const { stdout, stderr } = await execPromise(
      `psql "${dbUrl}" -c "${sql.replace(/"/g, '\\"')}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    if (stderr && !stderr.includes('NOTICE')) {
      console.warn('⚠️  Warnings:', stderr);
    }

    console.log(`✅ ${fileName} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${fileName} failed:`, error.message);
    throw error;
  }
}

async function deployAllMigrations() {
  try {
    console.log('🚀 Starting migration deployment...\n');

    // Find all migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migrations:`);
    files.forEach(f => console.log(`  - ${f}`));

    // Run migrations in order
    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      await runMigration(filePath);
    }

    console.log('\n🎉 All migrations deployed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Start building Capital Markets Intelligence API');
    console.log('  2. Implement Google Drive integration');
    console.log('  3. Deploy to Vercel\n');

  } catch (error) {
    console.error('\n💥 Migration deployment failed:\n', error.message);
    process.exit(1);
  }
}

deployAllMigrations();
