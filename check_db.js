const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load env vars
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

async function checkDB() {
  try {
    // Simple query
    console.log('Testing connection...')
    const test = await sql`SELECT 1 as ok`
    console.log('Connection OK:', test[0].ok)
    
    // Check migrations
    const migrations = await sql`SELECT name FROM migrations ORDER BY name`
    console.log('\n=== EXECUTED MIGRATIONS ===');
    migrations.forEach(m => console.log(m.name));
    
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}

checkDB();
