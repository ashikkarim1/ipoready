const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load DATABASE_URL
const envPath = '.env.local'
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

async function testDb() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await sql`SELECT 1 as test`
    console.log('✅ Database connected')
    
    // Check if migrations table exists
    const migrations = await sql`SELECT name FROM migrations ORDER BY id`
    console.log(`✅ Found ${migrations.length} completed migrations:`)
    migrations.forEach(m => console.log(`   - ${m.name}`))
    
    // Check key tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    console.log(`✅ Found ${tables.length} tables in public schema`)
    
    // Check for our critical tables
    const criticalTables = ['pace_sequencing_alerts', 'pace_score_history', 'companies', 'ipo_benchmarks']
    for (const table of criticalTables) {
      const exists = tables.find(t => t.table_name === table)
      console.log(`  ${exists ? '✅' : '❌'} ${table}`)
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  }
}

testDb()
