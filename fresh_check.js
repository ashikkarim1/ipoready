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

async function check() {
  try {
    // Get a fresh count 
    const result = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('cap_table_documents', 'share_classes_v2', 'shareholders', 'holdings', 
                         'vesting_schedules', 'cap_table_transactions', 'cap_table_scenarios',
                         'cap_table_validation_rules', 'cap_table_audit_logs',
                         'subscription_state_transitions', 'trial_auto_upgrade_queue',
                         'webhook_rate_limits', 'security_events')
    `
    
    console.log(`Created tables found: ${result[0].count}/13`)
    
    // List just the new ones
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('cap_table_documents', 'share_classes_v2', 'shareholders', 'holdings', 
                         'vesting_schedules', 'cap_table_transactions', 'cap_table_scenarios',
                         'cap_table_validation_rules', 'cap_table_audit_logs',
                         'subscription_state_transitions', 'trial_auto_upgrade_queue',
                         'webhook_rate_limits', 'security_events')
      ORDER BY table_name
    `
    
    console.log('\nTables created:')
    tables.forEach(t => console.log(`  ✅ ${t.table_name}`))
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

check()
