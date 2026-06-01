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
    // Check if users table exists
    const users = await sql`
      SELECT EXISTS(
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      ) as users_exists
    `
    console.log('Users table exists:', users[0].users_exists)
    
    // Check if auth schema exists
    const authSchema = await sql`
      SELECT EXISTS(
        SELECT FROM information_schema.schemata 
        WHERE schema_name = 'auth'
      ) as auth_schema_exists
    `
    console.log('Auth schema exists:', authSchema[0].auth_schema_exists)
    
    // Check actual migration errors
    console.log('\nAttempting to create a test table with auth.users reference...')
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS test_table (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
        )
      `
      console.log('✅ Auth.users reference works')
    } catch (e) {
      console.log('❌ Auth.users reference fails:', e.message)
      console.log('\nWill fix by using public.users instead...')
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

check()
