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
    
    console.log('\n✅ All public tables:')
    console.log('=' .repeat(80))
    tables.forEach(t => console.log(`  ${t.table_name}`))
    console.log('=' .repeat(80))
    
    // Check for cap_table and webhook tables specifically
    const capTableRelated = tables.filter(t => 
      t.table_name.includes('cap_table') || 
      t.table_name.includes('share_class') ||
      t.table_name.includes('shareholder') ||
      t.table_name.includes('holding')
    )
    
    const webhookRelated = tables.filter(t =>
      t.table_name.includes('subscription_state') ||
      t.table_name.includes('trial_auto') ||
      t.table_name.includes('security_event') ||
      t.table_name.includes('webhook_rate')
    )
    
    console.log('\nCap Table related tables:')
    capTableRelated.forEach(t => console.log(`  ✓ ${t.table_name}`))
    
    console.log('\nWebhook/Trial related tables:')
    webhookRelated.forEach(t => console.log(`  ✓ ${t.table_name}`))
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
    process.exit(1)
  }
}

check()
