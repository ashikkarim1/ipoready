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

async function verify() {
  try {
    const migrations = await sql`
      SELECT name, executed_at 
      FROM migrations 
      ORDER BY executed_at DESC 
      LIMIT 10
    `
    console.log('\n✅ MIGRATION VERIFICATION - Last 10 migrations:')
    console.log('=' .repeat(80))
    migrations.forEach(m => {
      console.log(`  ${m.name.padEnd(50)} ${new Date(m.executed_at).toISOString()}`)
    })
    console.log('=' .repeat(80))

    // Verify new tables exist
    console.log('\n✅ VERIFYING NEW TABLES:')
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN (
        'subscription_state_transitions',
        'trial_auto_upgrade_queue', 
        'security_events',
        'webhook_rate_limits',
        'cap_table_documents'
      )
      ORDER BY table_name
    `
    
    console.log(`  Found ${tables.length}/5 expected new tables:`)
    tables.forEach(t => console.log(`    ✓ ${t.table_name}`))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

verify()
