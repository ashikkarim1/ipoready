const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load environment from .env.local
const envPath = path.join(__dirname, '.env.local')
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

const sql = neon(process.env.DATABASE_URL)

async function resetAndMigrate() {
  try {
    // Delete old migration records for 006 and 007
    await sql`DELETE FROM migrations WHERE name = '006_cap_table_management_system.sql'`
    await sql`DELETE FROM migrations WHERE name = '007_webhook_security_and_trial_upgrade.sql'`
    console.log('✅ Cleared old migration records')
    
    // Read migration files
    const migration006 = fs.readFileSync('./migrations/006_cap_table_management_system.sql', 'utf8')
    const migration007 = fs.readFileSync('./migrations/007_webhook_security_and_trial_upgrade.sql', 'utf8')
    
    // Execute migration 006
    console.log('\nExecuting migration 006...')
    await sql.unsafe(migration006)
    await sql`INSERT INTO migrations (name) VALUES ('006_cap_table_management_system.sql')`
    console.log('✅ Migration 006 completed')
    
    // Execute migration 007
    console.log('\nExecuting migration 007...')
    await sql.unsafe(migration007)
    await sql`INSERT INTO migrations (name) VALUES ('007_webhook_security_and_trial_upgrade.sql')`
    console.log('✅ Migration 007 completed')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

resetAndMigrate()
