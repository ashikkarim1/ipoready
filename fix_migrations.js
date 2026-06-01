const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load env vars
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8')
  env.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      if (key && !process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const sql = neon(process.env.DATABASE_URL, { fetchConnectionCache: true })

async function fixMigrations() {
  try {
    console.log('Checking migration status...\n')
    
    // Create migrations table if needed
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    
    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
    
    // For each migration 008, 009, 010 - delete from tracking and re-run
    const problematicMigrations = ['008_slack_integration.sql', '009_add_missing_holdings_table.sql', '010_complete_cap_table_schema.sql']
    
    for (const file of problematicMigrations) {
      console.log(`Resetting migration: ${file}`)
      try {
        await sql`DELETE FROM migrations WHERE name = ${file}`
        console.log(`  ✓ Removed from tracking\n`)
      } catch (e) {
        console.log(`  - Not in tracking\n`)
      }
    }
    
    console.log('Migrations reset. Now run: npm run db:migrate')
    
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

fixMigrations()
