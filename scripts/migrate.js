const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local if running outside of Next.js
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env.local')
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
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check .env.local file.')
}

const sql = neon(process.env.DATABASE_URL)

async function createMigrationTracker() {
  // Create migration tracking table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

async function runMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'migrations')
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found.')
    return
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    try {
      // Check if migration already ran
      const result = await sql`
        SELECT * FROM migrations WHERE name = ${file}
      `

      if (result.length > 0) {
        console.log(`⏭️  Skipping migration ${file} (already executed)`)
        continue
      }

      // Read and execute migration
      const filePath = path.join(migrationsDir, file)
      const content = fs.readFileSync(filePath, 'utf8')

      // Execute the entire SQL file as one statement
      await sql.unsafe(content)

      // Mark migration as complete
      await sql`
        INSERT INTO migrations (name) VALUES (${file})
      `

      console.log(`✅ Migration ${file} completed`)
    } catch (error) {
      console.error(`❌ Migration ${file} failed:`, error.message)
      throw error
    }
  }
}

async function migrate() {
  console.log('Running IPOReady database migration...')

  // Ensure migration tracker exists
  await createMigrationTracker()

  // Run all migration files
  await runMigrationFiles()

  console.log('✅ All database migrations complete!')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})