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

async function runMigration() {
  try {
    console.log('🚀 Running Cap Table & Webhook Security Migrations\n')
    
    // Delete migration records to re-run
    await sql`DELETE FROM migrations WHERE name IN ('006_cap_table_management_system.sql', '007_webhook_security_and_trial_upgrade.sql')`
    console.log('✅ Cleared previous migration records')
    
    // Read migration files
    const mig006 = fs.readFileSync('./migrations/006_cap_table_management_system.sql', 'utf8')
    const mig007 = fs.readFileSync('./migrations/007_webhook_security_and_trial_upgrade.sql', 'utf8')
    
    // Execute migration 006 - Cap Table Schema
    console.log('\n📦 Migration 006: Cap Table Management System')
    try {
      await sql.unsafe(mig006)
      await sql`INSERT INTO migrations (name) VALUES ('006_cap_table_management_system.sql')`
      console.log('✅ Cap Table schema created')
      console.log('   - cap_table_documents')
      console.log('   - share_classes_v2')
      console.log('   - shareholders')
      console.log('   - holdings')
      console.log('   - vesting_schedules')
      console.log('   - cap_table_transactions')
      console.log('   - cap_table_scenarios')
      console.log('   - cap_table_validation_rules')
      console.log('   - cap_table_audit_logs')
    } catch (e) {
      console.error('❌ Migration 006 failed:', e.message)
      throw e
    }
    
    // Execute migration 007 - Webhook & Trial Security
    console.log('\n🔒 Migration 007: Webhook Security & Trial Auto-Upgrade')
    try {
      await sql.unsafe(mig007)
      await sql`INSERT INTO migrations (name) VALUES ('007_webhook_security_and_trial_upgrade.sql')`
      console.log('✅ Webhook & Trial tables created')
      console.log('   - subscription_state_transitions')
      console.log('   - trial_auto_upgrade_queue')
      console.log('   - webhook_rate_limits')
      console.log('   - security_events')
      console.log('   - webhook_logs (enhanced with security columns)')
    } catch (e) {
      console.error('❌ Migration 007 failed:', e.message)
      throw e
    }
    
    console.log('\n✅ All migrations completed successfully!')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
