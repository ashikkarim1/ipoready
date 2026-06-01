const { neon } = require('@neondatabase/serverless')

// Create unpooled connection by replacing -pooler with direct endpoint
const pooledUrl = 'postgresql://neondb_owner:npg_CA0Le4RlEnzU@ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
const unpooledUrl = pooledUrl.replace('-pooler', '')

console.log('Connecting with unpooled URL to verify table creation...\n')

const sql = neon(unpooledUrl)

async function verify() {
  try {
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
    
    console.log(`✅ Created tables found: ${result[0].count}/13`)
    
    if (result[0].count > 0) {
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
      
      console.log('\nTables verified:')
      tables.forEach(t => console.log(`  ✅ ${t.table_name}`))
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

verify()
