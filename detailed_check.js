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
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    const expectedCapTables = [
      'cap_table_documents',
      'share_classes_v2',
      'shareholders',
      'holdings',
      'vesting_schedules',
      'cap_table_transactions',
      'cap_table_scenarios',
      'cap_table_validation_rules',
      'cap_table_audit_logs'
    ]
    
    const expectedWebhookTables = [
      'subscription_state_transitions',
      'trial_auto_upgrade_queue',
      'webhook_rate_limits',
      'security_events'
    ]
    
    const allTableNames = tables.map(t => t.table_name)
    
    console.log('\n===== PHASE 1 DATABASE MIGRATION VERIFICATION =====\n')
    
    console.log('CAP TABLE MANAGEMENT SYSTEM TABLES:')
    console.log('=' .repeat(60))
    expectedCapTables.forEach(tname => {
      const exists = allTableNames.includes(tname)
      const icon = exists ? '✅' : '❌'
      console.log(`${icon} ${tname.padEnd(40)}  ${exists ? 'CREATED' : 'MISSING'}`)
    })
    
    console.log('\nWEBHOOK SECURITY & TRIAL AUTO-UPGRADE TABLES:')
    console.log('=' .repeat(60))
    expectedWebhookTables.forEach(tname => {
      const exists = allTableNames.includes(tname)
      const icon = exists ? '✅' : '❌'
      console.log(`${icon} ${tname.padEnd(40)}  ${exists ? 'CREATED' : 'MISSING'}`)
    })
    
    // Count created tables
    const capCreated = expectedCapTables.filter(t => allTableNames.includes(t)).length
    const webhookCreated = expectedWebhookTables.filter(t => allTableNames.includes(t)).length
    
    console.log('\n===== SUMMARY =====')
    console.log(`Cap Table Tables: ${capCreated}/${expectedCapTables.length} created`)
    console.log(`Webhook Tables: ${webhookCreated}/${expectedWebhookTables.length} created`)
    console.log(`Total New Tables: ${capCreated + webhookCreated}/${expectedCapTables.length + expectedWebhookTables.length}`)
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

check()
