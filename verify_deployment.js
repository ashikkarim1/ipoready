const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load env
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

const sql = neon(process.env.DATABASE_URL)

async function verify() {
  try {
    console.log('1. Testing database connection...')
    const result = await sql`SELECT NOW() as now`
    console.log('   ✓ Connection successful')
    console.log(`   Database time: ${result[0].now}\n`)
    
    console.log('2. Checking tables...')
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    console.log(`   ✓ Found ${tables.length} tables`)
    
    // Check critical tables
    const criticalTables = ['holdings', 'slack_queue', 'slack_logs', 'share_classes_v2', 'shareholders']
    for (const tableName of criticalTables) {
      const exists = tables.some(t => t.table_name === tableName)
      console.log(`   ${exists ? '✓' : '✗'} ${tableName}`)
    }
    
    console.log('\n3. Checking migrations...')
    const migrations = await sql`SELECT name FROM migrations ORDER BY name`
    console.log(`   ✓ Migrations executed: ${migrations.length}`)
    migrations.forEach(m => console.log(`     - ${m.name}`))
    
  } catch (e) {
    console.error('✗ Error:', e.message)
    process.exit(1)
  }
}

verify()
