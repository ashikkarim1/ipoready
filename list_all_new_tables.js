const { neon } = require('@neondatabase/serverless')
const fs = require('fs')

// Use unpooled connection
const pooledUrl = 'postgresql://neondb_owner:npg_CA0Le4RlEnzU@ep-plain-fire-aqxix340-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
const unpooledUrl = pooledUrl.replace('-pooler', '')

const sql = neon(unpooledUrl)

async function check() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND (
        table_name LIKE 'cap_table%' OR
        table_name LIKE 'share_class%' OR
        table_name LIKE 'shareholder%' OR
        table_name LIKE 'holding%' OR
        table_name LIKE 'vesting%' OR
        table_name LIKE 'subscription_%' OR
        table_name LIKE 'trial_%' OR
        table_name LIKE 'webhook_%' OR
        table_name LIKE 'security_%'
      )
      ORDER BY table_name
    `
    
    console.log(`Found ${tables.length} tables matching new schema patterns:\n`)
    tables.forEach(t => console.log(`  ${t.table_name}`))
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

check()
